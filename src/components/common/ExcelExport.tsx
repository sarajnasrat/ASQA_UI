import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";

interface ExcelExportProps<T extends Record<string, any>> {
  data: T[];
  totalElements?: number;
  fileName?: string;
  sheetName?: string;
  fetchAllData?: () => Promise<T[]>;
  className?: string;
}

const ExcelExport = <T extends Record<string, any>>({
  data = [],
  totalElements = 0,
  fileName = "export",
  sheetName = "Sheet1",
  fetchAllData,
  className = "",
}: ExcelExportProps<T>) => {
  const menu = useRef<Menu>(null);

  const [loading, setLoading] = useState(false);

  const capitalizeHeader = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const flattenValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value
        .map((item) =>
          typeof item === "object" && item !== null
            ? Object.values(item).join(" - ")
            : String(item)
        )
        .join(", ");
    }

    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return value ?? "";
  };

  const formatData = (items: T[]) =>
    items.map((item, index) => {
      const row: Record<string, any> = {
        No: index + 1,
      };

      Object.keys(item).forEach((key) => {
        row[capitalizeHeader(key)] = flattenValue(item[key]);
      });

      return row;
    });

  const autoFitColumns = (data: Record<string, any>[]) => {
    const columns = Object.keys(data[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || "").length)
      );

      return {
        wch: Math.min(maxLength + 5, 50),
      };
    });

    return columns;
  };

  const exportExcel = (items: T[]) => {
    const formattedData = formatData(items);

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    worksheet["!cols"] = autoFitColumns(formattedData);

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "");

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });

      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
          sz: 12,
        },
        fill: {
          fgColor: { rgb: "16A34A" },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, `${fileName}.xlsx`, {
      cellStyles: true,
    });
  };

  const exportCurrentPage = () => {
    exportExcel(data);
  };

  const exportAllData = async () => {
    if (!fetchAllData) return;

    try {
      setLoading(true);

      const allData = await fetchAllData();

      exportExcel(allData);
    } finally {
      setLoading(false);
    }
  };

  const items: MenuItem[] = [
    {
      label: "Current Page",
      icon: "pi pi-file-excel",
      command: exportCurrentPage,
    },
    {
      label: `All Data (${totalElements})`,
      icon: "pi pi-database",
      command: exportAllData,
    },
  ];

  return (
    <>
      <Menu model={items} popup ref={menu} />

      <Button
        type="button"
        icon="pi pi-download"
        text
        raised
        label={loading ? "Exporting..." : "Export"}
        severity="success"
        outlined
        onClick={(e) => menu.current?.toggle(e)}
        loading={loading}
        className={className}
      />
    </>
  );
};

export default ExcelExport;