import React, { useEffect, useRef, useState, useTransition } from "react";
import { useAppToast } from "../../../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import CountryService from "../../../../services/country.service";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import DynamicBreadcrumb from "../../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../../common/DynamicTable";
import { CountryCreate } from "./CountryCreate"; // Import the CountryCreate dialog
import { CountryUpdate } from "./CountryUpdate";
import { useTranslation } from "react-i18next";
export const CountryList = () => {
  const [countryList, setCountryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast, showToast } = useAppToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); //------------- Edit Country---------------------//
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const handleEdit = (country: any) => {
    setSelectedCountryId(country.id);
    setShowEditDialog(true);
  };

  // pagination state
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    getAllCountries();
  }, [first, rows]);

  const getAllCountries = async () => {
    try {
      setLoading(true);
      const res = await CountryService.getPaginatedCountries({
        page: first / rows,
        size: rows,
        sort: "id,desc",
      });
      setCountryList(res.data.data);
      setTotalRecords(res.data.totalElements);
      setLoading(false);
    } catch (error) {
      showToast("error", "Error", "Failed to load countries");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    getAllCountries(); // Refresh the list
    showToast("success", "Success", "Country created successfully");
  };

  const dateBodyTemplate = (rowData: any) => {
    if (!rowData.createdDate) return <span className="text-gray-400">—</span>;

    const date = new Date(rowData.createdDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-700">{formattedDate}</span>
        <span className="text-xs text-gray-400">{formattedTime}</span>
      </div>
    );
  };

  const confirmDelete = (country: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <i className="pi pi-trash text-3xl text-white"></i>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            {t("country.delete")}
          </span>
          <p className="text-gray-600 text-center">
            {t("country.deleteConfirm", {
              name: country.countryName || country.countryCode,
            })}
          </p>
        </div>
      ),
      header: "",
      acceptLabel: t("country.delete"),
      rejectLabel: t("common.cancel"),
      accept: () => handleDelete(country.id),
      closeOnEscape: true,
      dismissableMask: true,
      breakpoints: {
        "960px": "90vw",
        "640px": "95vw",
      },
    });
  };

  const handleDelete = async (id: any) => {
    try {
      await CountryService.deleteCountry(id);
      showToast("success", "Success", "Country Deleted Successfully");
      await getAllCountries();
    } catch (error) {
      showToast("error", "Error", "Failed to delete country");
    }
  };

  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      },
      {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
      {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => navigate(`/countries/view/${rowData.id}`),
      },
    ];

    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-text p-button-sm"
          onClick={(e) => menu.current.toggle(e)}
        />
      </div>
    );
  };

  const header = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {t("country.list")}
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {totalRecords} {t("common.total")}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            icon="pi pi-plus"
            label={t("country.create")}
            text
            raised
            severity="info"
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 border-none shadow-md hover:shadow-lg transition-all"
          />

          <Button
            icon="pi pi-sync"
            label={t("common.refersh")}
            text
            severity="info"
            raised
            onClick={getAllCountries}
          />
        </div>
      </div>
    );
  };

  const columns = [
    {
      field: "id",
      header: "ID",
      style: { width: "80px" },
      className: "text-sm font-medium text-gray-600",
    },
    {
      field: "countryName",
      header: t("country.name"),
      sortable: true,
      style: { minWidth: "200px" },
      body: (rowData: any) => (
        <span className="font-medium text-gray-800">
          {rowData.countryName || "—"}
        </span>
      ),
    },
    {
      field: "countryCode",
      header:  t("country.code"),
      style: { minWidth: "120px" },
      body: (rowData: any) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-sm">
          {rowData.countryCode || "—"}
        </span>
      ),
    },
    // {
    //   field: "createdDate",
    //   header: "Created Date",
    //   body: dateBodyTemplate,
    //   style: { minWidth: "150px" },
    // },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "140px" },
    },
  ];

  const breadcrumbItems = [{ label: "Country", url: "" }];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      {showCreateDialog && (
        <CountryCreate
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditDialog && selectedCountryId && (
        <CountryUpdate
          countryId={selectedCountryId}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false);
            getAllCountries();
          }}
        />
      )}

      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />

      <DynamicTable
        title="Country Management"
        value={countryList}
        columns={columns}
        header={header()}
        loading={loading}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
        }}
      />
    </>
  );
};
