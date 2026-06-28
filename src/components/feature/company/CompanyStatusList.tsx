import React, { useEffect, useRef, useState } from "react";
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

interface CompanyStatusListProps {
  status?:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "STANDARDS_PROVIDED"
    | "DEADLINE_REQUIRED"
    | "DEADLINE_ASSIGNED"
    | "INSPECTION_IN_PROGRESS"
    | "REPORTED_TO_COMMITTEE"
    | "REPORT_APPROVED"
    | "PAYMENT_PENDING"
    | "PAYMENT_COMPLETED"
    | "CERTIFICATE_ISSUED"
    | "UNDER_SUPERVISION"
    | "REJECTED"
    | "CANCELLED"
    | "COMMITTEE_APPROVED"
    | "APPROVAL_IN_PROGRESS";
  statuses?: Array<
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "STANDARDS_PROVIDED"
    | "DEADLINE_REQUIRED"
    | "DEADLINE_ASSIGNED"
    | "INSPECTION_IN_PROGRESS"
    | "REPORTED_TO_COMMITTEE"
    | "REPORT_APPROVED"
    | "PAYMENT_PENDING"
    | "PAYMENT_COMPLETED"
    | "CERTIFICATE_ISSUED"
    | "UNDER_SUPERVISION"
    | "REJECTED"
    | "CANCELLED"
    | "COMMITTEE_APPROVED"
    | "APPROVAL_IN_PROGRESS"
  >;
  title?: string;
}

type CompanyRequestStatus =
  | "CERTIFICATE_ISSUED"
  | "REJECTED"
  | "UNDER_REVIEW"
  | "INSPECTION_IN_PROGRESS"
  | "PAYMENT_PENDING";

const STATUS_LABELS: Record<CompanyRequestStatus, string> = {
  CERTIFICATE_ISSUED: "Certificate Issued",
  REJECTED: "Rejected",
  UNDER_REVIEW: "Under Review",
  INSPECTION_IN_PROGRESS: "Inspection In Progress",
  PAYMENT_PENDING: "Payment Pending",
};

const STATUS_ROUTES: Record<CompanyRequestStatus, string> = {
  CERTIFICATE_ISSUED: "/company/certificate-issued",
  REJECTED: "/company/rejected",
  UNDER_REVIEW: "/company/under-review",
  INSPECTION_IN_PROGRESS: "/company/inspection-in-progress",
  PAYMENT_PENDING: "/company/payment-pending",
};

const isMappedStatus = (
  value?: CompanyStatusListProps["status"],
): value is CompanyRequestStatus =>
  Boolean(
    value &&
      Object.prototype.hasOwnProperty.call(STATUS_LABELS, value),
  );

export const CompanyStatusList: React.FC<CompanyStatusListProps> = ({
  status,
  statuses,
  title,
}) => {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const { hasPermission, withPermission } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const activeStatuses = statuses?.length
    ? statuses
    : status
      ? [status]
      : [];
  const primaryStatus = activeStatuses[0];
  const mappedStatuses = activeStatuses.filter(isMappedStatus);
  const activeSidebarPath = mappedStatuses[0]
    ? STATUS_ROUTES[mappedStatuses[0]]
    : "/company";
  const pageTitle =
    title ||
    `${t("company.list")}`;

  const getCompanies = async () => {
    setLoading(true);
    try {
      const requestParams = {
        page: first / rows,
        size: rows,
        sort: "id,desc",
      };
      const res =
        activeStatuses.length > 1
          ? await CompanyService.getPaginatedCompaniesByRequestStatuses(
              activeStatuses,
              requestParams,
            )
          : await CompanyService.getPaginatedCompaniesByRequestStatus(
              primaryStatus!,
              requestParams,
            );
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
    if (!activeStatuses.length) return;
    getCompanies();
  }, [first, rows, activeStatuses.join(",")]);

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
        command: () =>
          navigate(`/company/view/${rowData.id}`, {
            state: {
              originPath: activeSidebarPath,
              activeSidebarPath,
            },
          }),
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
    <div className="mb-4 flex flex-col items-center justify-between gap-4 px-2 md:flex-row">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">{pageTitle}</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 shadow-sm">
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
          fileName={`companies-${activeStatuses.join("-").toLowerCase()}`}
          sheetName={
            title ||
            (mappedStatuses.length
              ? mappedStatuses.map((item) => STATUS_LABELS[item]).join(", ")
              : t("company.list"))
          }
          fetchAllData={async () => {
            const res =
              activeStatuses.length > 1
                ? await CompanyService.getAllCompaniesByRequestStatuses(
                    activeStatuses,
                  )
                : await CompanyService.getAllCompaniesByRequestStatus(
                    primaryStatus!,
                  );
            return activeStatuses.length > 1 ? res.data.data : res.data;
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
      body: (row: any) => (
        <span>{row.phoneNumber || t("common.notSpecified")}</span>
      ),
    },
    {
      field: "jawazNumber",
      header: t("company.labels.jawazNumber") || "Jawaz Number",
      style: { minWidth: "160px" },
      body: (row: any) => (
        <span>{row.jawazNumber || t("common.notSpecified")}</span>
      ),
    },
    {
      field: "companyType",
      header: t("company.labels.companyType") || "Company Type",
      style: { minWidth: "160px" },
      body: (row: any) => (
        <span>{row.companyType || t("common.notSpecified")}</span>
      ),
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

  const breadcrumbItems = [{ label: pageTitle, url: "" }];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />
      <DynamicTable
        title={pageTitle}
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

export default CompanyStatusList;
