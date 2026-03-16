import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import CompanyService from "../../../services/company.service";

export const CompanyList: React.FC = () => {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch companies with pagination
  const getCompanies = async () => {
    setLoading(true);
    try {
      const res = await CompanyService.getPaginatedCompanies({
        page: first / rows,
        size: rows,
        sort: "id,desc",
      });
      setCompanies(res.data.data);
      setTotalRecords(res.data.totalElements);
    } catch (error) {
      toast.current?.show({ severity: "error", summary: t("common.error"), detail: t("company.loadFailed"), life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompanies();
  }, [first, rows]);

  // Actions
  const handleDelete = async (id: number) => {
    try {
      await CompanyService.deleteCompany(id);
      toast.current?.show({ severity: "success", summary: t("common.success"), detail: t("company.deleted"), life: 3000 });
      getCompanies();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: t("common.error"), detail: t("company.deleteFailed"), life: 4000 });
    }
  };

  const confirmDelete = (company: any) => {
    confirmDialog({
      message: t("company.deleteConfirm", { name: company.companyNameEN || "—" }),
      header: t("company.delete"),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: t("common.delete"),
      rejectLabel: t("common.cancel"),
      accept: () => handleDelete(company.id),
    });
  };

  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);
    const items: MenuItem[] = [
      {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => navigate(`/company/edit/${rowData.id}`),
      },
      {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
      {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => navigate(`/company/view/${rowData.id}`),
      },
    ];
    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button icon="pi pi-ellipsis-v" className="p-button-text p-button-sm" onClick={(e) => menu.current.toggle(e)} />
      </div>
    );
  };

  const header = () => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">{t("company.list")}</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
          {totalRecords} {t("common.total")}
        </span>
      </div>
      <div className="flex gap-3">
        <Button
          icon="pi pi-plus"
          label={t("company.create")}
          text
          raised
          severity="info"
          onClick={() => navigate("/company/create")}
        />
        <Button icon="pi pi-sync" label={t("common.refersh")} text raised severity="info" onClick={getCompanies} />
      </div>
    </div>
  );

  const columns = [
    { field: "id", header: "ID", style: { width: "80px" }, body: (row: any) => <span>{row.id}</span> },
    { field: "companyNameEN", header: t("company.companyNameEN"), sortable: true, style: { minWidth: "200px" }, body: (row: any) => <span>{row.companyNameEN || "—"}</span> },
    { field: "email", header: t("company.email"), sortable: true, style: { minWidth: "200px" }, body: (row: any) => <span>{row.email || "—"}</span> },
    { field: "phoneNumber", header: t("company.phoneNumber"), style: { minWidth: "150px" }, body: (row: any) => <span>{row.phoneNumber || "—"}</span> },
    { header: t("common.action"), body: actionTemplate, style: { width: "140px" } },
  ];

  const breadcrumbItems = [{ label: "Company", url: "" }];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DynamicBreadcrumb items={breadcrumbItems} size="pl-5 pr-5 max-w-8xl mx-auto mt-3" />
      <DynamicTable
        title={t("company.list")}
        value={companies}
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

export default CompanyList;