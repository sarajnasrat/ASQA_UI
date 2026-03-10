import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";

interface ColumnConfig {
  field?: string;
  header: string;
  body?: (rowData: any) => React.ReactNode;
  sortable?: boolean;
  sortField?: string;
  style?: React.CSSProperties;
  className?: string;
}

interface DynamicTableProps {
  title: string;
  value: any[];
  columns: ColumnConfig[];
  header?: React.ReactNode;
  loading?: boolean;
  first: number;
  rows: number;
  totalRecords: number;
  onPage: (event: any) => void;
  globalFilter?: string;
  rowsPerPageOptions?: number[];
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  value,
  columns,
  header,
  loading,
  first,
  rows,
  totalRecords,
  onPage,
  globalFilter,
  rowsPerPageOptions = [5, 10, 25, 50],
}) => {
  return (
    <div
      className="pl-5 pr-5 md:pb-6 max-w-8xl mx-auto"
    >
      <Card className="shadow-xl border-0 rounded-xl overflow-hidden bg-white">
        <DataTable
          value={value}
          lazy
          paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          loading={loading}
          loadingIcon="pi pi-spin pi-spinner text-blue-500"
          responsiveLayout="scroll"
          emptyMessage="No data found"
          selectionMode="single"
          className="p-datatable-sm"
          scrollable
            scrollHeight="500px"
          height={"12rem"}
          header={header}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          rowsPerPageOptions={rowsPerPageOptions}
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
          globalFilter={globalFilter}
          stripedRows
        >
          {columns.map((col, index) => (
            <Column
              key={index}
              field={col.field}
              header={col.header}
              body={col.body}
              sortable={col.sortable}
              sortField={col.sortField}
              style={col.style}
              className={col.className}
            />
          ))}
        </DataTable>
      </Card>
    </div>
  );
};
