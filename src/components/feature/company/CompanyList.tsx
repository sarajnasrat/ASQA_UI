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
import ExcelExport from "../../common/ExcelExport";
import i18n from "../../../i18n/i18n";
import { useAuth } from "../../../context/AuthContext";

export const CompanyList: React.FC = () => {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const { hasPermission, withPermission } = useAuth();
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
      toast.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: t("company.loadFailed"),
        life: 3000,
      });
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
      toast.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: t("company.deleted"),
        life: 3000,
      });
      getCompanies();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: t("company.deleteFailed"),
        life: 4000,
      });
    }
  };

  const confirmDelete = (company: any) => {
    confirmDialog({
      message: t("company.deleteConfirm", {
        name: company.companyNameEN || t("common.notSpecified"),
      }),
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
      ...withPermission("UPDATE_COMPANY", {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => navigate(`/company/edit/${rowData.id}`),
      }),
      {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
      ...withPermission("VIEW_COMPANY", {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => navigate(`/company/view/${rowData.id}`),
      }),
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

  const header = () => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">{t("company.list")}</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
          {totalRecords} {t("common.total")}
        </span>
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
        {hasPermission("CREATE_COMPANY") && (
          <Button
            icon="pi pi-plus"
            label={t("company.create")}
            text
            raised
            severity="info"
            onClick={() => navigate("/company/create")}
          />
        )}
        <Button
          icon="pi pi-sync"
          label={t("common.refresh")}
          text
          raised
          severity="info"
          onClick={getCompanies}
        />

        <ExcelExport
          data={companies}
          totalElements={totalRecords}
          fileName="companies"
          sheetName="Companies"
          fetchAllData={async () => {
            const res = await CompanyService.getPaginatedCompanies({
              page: 0,
              size: totalRecords,
              sort: "id,desc",
            });

            return res.data.data;
          }}
        />
      </div>
    </div>
  );

  const columns = [
    {
      field: "id",
      header: t("common.id"),
      style: { width: "80px" },
      body: (row: any) => <span>{row.id}</span>,
    },

    {
      field: "logoUrl",
      header: t("company.labels.logoUrl") || "Logo",
      style: { width: "100px" },
      body: (row: any) =>
        row.logoUrl ? (
          <img
            src={`http://localhost:8080${row.logoUrl}`}
            alt={t("company.labels.companyLogo")}
            className="h-12 w-12 rounded-full border object-cover shadow-sm"
          />
        ) : (
          <span>{t("common.notSpecified")}</span>
        ),
    },

    {
      field: "companyName",
      header: t("company.labels.companyName") || "Company Name",
      style: { minWidth: "240px" },
      body: (row: any) => {
        const currentLanguage = i18n.language;

        const companyName =
          currentLanguage === "dr"
            ? row.companyNameDR
            : currentLanguage === "ps"
              ? row.companyNamePS
              : row.companyNameEN;

        return <span>{companyName || t("common.notSpecified")}</span>;
      },
    },

    {
      field: "email",
      header: t("company.labels.email"),
      style: { minWidth: "220px" },
      body: (row: any) => <span>{row.email || t("common.notSpecified")}</span>,
    },

    {
      field: "phoneNumber",
      header: t("company.labels.phoneNumber"),
      style: { minWidth: "160px" },
      body: (row: any) => <span>{row.phoneNumber || t("common.notSpecified")}</span>,
    },

    {
      field: "jawazNumber",
      header: t("company.labels.jawazNumber") || "Jawaz Number",
      style: { minWidth: "160px" },
      body: (row: any) => <span>{row.jawazNumber || t("common.notSpecified")}</span>,
    },

    {
      field: "companyOwnerName",
      header: t("company.labels.companyOwnerName") || "Owner Name",
      style: { minWidth: "220px" },
      body: (row: any) => {
        const currentLanguage = i18n.language;

        const ownerName =
          currentLanguage === "dr"
            ? row.aboutCompanyDr
            : currentLanguage === "ps"
              ? row.aboutCompanyPs
              : row.companyOwnerNameEn;

        return <span>{ownerName || t("common.notSpecified")}</span>;
      },
    },

    {
      field: "companyType",
      header: t("company.labels.companyType") || "Company Type",
      style: { minWidth: "160px" },
      body: (row: any) => <span>{row.companyType || t("common.notSpecified")}</span>,
    },

    {
      field: "active",
      header: t("company.status.title") || "Status",
      style: { minWidth: "130px" },
      body: (row: any) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            row.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.active
            ? t("common.active") || "Active"
            : t("common.inactive") || "Inactive"}
        </span>
      ),
    },

    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "140px" },
    },
  ];
  const breadcrumbItems = [{ label: t("company.list"), url: "" }];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />
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
