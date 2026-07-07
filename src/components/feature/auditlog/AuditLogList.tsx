import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import AuditLogService from "../../../services/auditlog.service";
import AuditLogDetails from "./AuditLogDetails";

type AuditLogItem = {
  id: number;
  userId?: number | null;
  username?: string | null;
  fullName?: string | null;
  roleName?: string | null;
  entityName?: string | null;
  ipAddress?: string | null;
  action?: string | null;
  httpMethod?: string | null;
  status?: string | null;
  entityId?: string | null;
  createdAt?: string | null;
  details?: Array<{
    id: number;
    fieldName?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
    createdAt?: string | null;
  }>;
};

const methodSeverityMap: Record<string, "success" | "info" | "warning" | "danger"> =
  {
    GET: "info",
    POST: "success",
    PUT: "warning",
    PATCH: "warning",
    DELETE: "danger",
  };

const actionSeverityMap: Record<string, "success" | "info" | "warning" | "danger"> =
  {
    CREATE: "success",
    UPDATE: "warning",
    DELETE: "danger",
  };

const normalizeText = (value?: string | null) => value?.trim() || "-";

const AuditLogList = () => {
  const { t } = useTranslation();
  const { showError } = useToast();

  const [list, setList] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedViewId, setSelectedViewId] = useState<number | null>(null);

  const actionOptions = [
    { label: t("auditLog.filters.allActions"), value: null },
    { label: t("auditLog.actions.CREATE"), value: "CREATE" },
    { label: t("auditLog.actions.UPDATE"), value: "UPDATE" },
    { label: t("auditLog.actions.DELETE"), value: "DELETE" },
  ];

  const statusOptions = [
    { label: t("auditLog.filters.allStatuses"), value: null },
    { label: t("auditLog.status.SUCCESS"), value: "SUCCESS" },
    { label: t("auditLog.status.FAILED"), value: "FAILED" },
  ];

  const loadData = async () => {
    setLoading(true);

    const response = await handleApi(
      () =>
        AuditLogService.getPaginatedAuditLogs({
          page: first / rows,
          size: rows,
          sort: "id,desc",
          ...(selectedAction ? { action: selectedAction } : {}),
          ...(selectedStatus ? { status: selectedStatus } : {}),
        }),
      () => {},
      showError,
      t,
    );

    if (response) {
      setList(response.data?.data || []);
      setTotalRecords(response.data?.totalElements || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [first, rows, selectedAction, selectedStatus]);

  const filteredList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return list;

    return list.filter((item) =>
      [
        item.username,
        item.fullName,
        item.roleName,
        item.entityName,
        item.action,
        item.status,
        item.httpMethod,
        item.ipAddress,
        item.entityId,
        item.details?.map((detail) => detail.fieldName).join(", "),
      ].some((value) => String(value || "").toLowerCase().includes(term)),
    );
  }, [list, searchTerm]);

  const columns = [
    { field: "id", header: t("common.id") },
    {
      field: "username",
      header: t("auditLog.columns.user"),
      body: (row: AuditLogItem) => (
        <div className="min-w-[180px]">
          <div className="font-semibold text-gray-800">
            {normalizeText(row.fullName || row.username)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {normalizeText(row.username)}
          </div>
        </div>
      ),
    },
    {
      field: "roleName",
      header: t("auditLog.columns.role"),
      body: (row: AuditLogItem) => normalizeText(row.roleName),
    },
    {
      field: "entityName",
      header: t("auditLog.columns.entity"),
      body: (row: AuditLogItem) => (
        <div className="min-w-35">
          <div className="font-medium">{normalizeText(row.entityName)}</div>
        </div>
      ),
    },
    {
      field: "action",
      header: t("auditLog.columns.action"),
      body: (row: AuditLogItem) => (
        <Tag
          value={t(`auditLog.actions.${row.action || "UNKNOWN"}`, {
            defaultValue: normalizeText(row.action),
          })}
          severity={actionSeverityMap[row.action || ""] || "info"}
        />
      ),
    },
    // {
    //   field: "httpMethod",
    //   header: t("auditLog.columns.method"),
    //   body: (row: AuditLogItem) => (
    //     <Tag
    //       value={normalizeText(row.httpMethod)}
    //       severity={methodSeverityMap[row.httpMethod || ""] || "info"}
    //     />
    //   ),
    // },
    {
      field: "status",
      header: t("auditLog.columns.status"),
      body: (row: AuditLogItem) => (
        <Tag
          value={t(`auditLog.status.${row.status || "UNKNOWN"}`, {
            defaultValue: normalizeText(row.status),
          })}
          severity={row.status === "SUCCESS" ? "success" : "danger"}
        />
      ),
    },
    // {
    //   field: "entityId",
    //   header: t("auditLog.columns.entityId"),
    //   body: (row: AuditLogItem) => normalizeText(row.entityId),
    // },
    // {
    //   field: "changes",
    //   header: t("auditLog.columns.changes"),
    //   body: (row: AuditLogItem) => {
    //     const details = row.details || [];

    //     if (details.length === 0) {
    //       return (
    //         <div className="max-w-[340px] text-sm text-gray-500">
    //           {t("auditLog.noDetailChanges")}
    //         </div>
    //       );
    //     }

    //     return (
    //       <div className="max-w-[340px] text-sm whitespace-normal">
    //         <div className="font-medium text-gray-800">
    //           {t("auditLog.changeSummary", { count: details.length })}
    //         </div>
    //         <div className="text-xs text-gray-500 mt-1">
    //           {details
    //             .slice(0, 3)
    //             .map((detail) => normalizeText(detail.fieldName))
    //             .join(", ")}
    //           {details.length > 3 ? "..." : ""}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      field: "ipAddress",
      header: t("auditLog.columns.ipAddress"),
      body: (row: AuditLogItem) => normalizeText(row.ipAddress),
    },
    {
      field: "createdDate",
      header: t("common.createdDate"),
      body: (row: AuditLogItem) =>
        row.createdAt
          ? IslamicDateFormatter.formatQamari(row.createdAt, true)
          : t("common.notSpecified"),
    },
    {
      header: t("common.action"),
      body: (rowData: AuditLogItem) => (
        <div className="flex justify-center">
          <Button
            icon="pi pi-eye"
            className="p-button-text p-button-sm"
            onClick={() => {
              setSelectedViewId(rowData.id);
              setShowDetails(true);
            }}
          />
        </div>
      ),
      style: { width: "120px" },
    },
  ];

  const header = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {t("auditLog.title")}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("auditLog.manageDescription")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            icon="pi pi-refresh"
            label={t("common.refresh")}
            text
            raised
            onClick={loadData}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
        <div className="flex-1">
          <label className="block pb-2 text-sm font-medium text-gray-700">
            {t("auditLog.filters.search")}
          </label>
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("auditLog.placeholders.search")}
            className="w-full"
          />
        </div>
        <div className="min-w-[200px]">
          <label className="block pb-2 text-sm font-medium text-gray-700">
            {t("auditLog.filters.action")}
          </label>
          <Dropdown
            value={selectedAction}
            options={actionOptions}
            onChange={(e) => {
              setFirst(0);
              setSelectedAction(e.value ?? null);
            }}
            optionLabel="label"
            optionValue="value"
            showClear
            className="w-full"
            placeholder={t("auditLog.placeholders.action")}
          />
        </div>
        <div className="min-w-[200px]">
          <label className="block pb-2 text-sm font-medium text-gray-700">
            {t("auditLog.filters.status")}
          </label>
          <Dropdown
            value={selectedStatus}
            options={statusOptions}
            onChange={(e) => {
              setFirst(0);
              setSelectedStatus(e.value ?? null);
            }}
            optionLabel="label"
            optionValue="value"
            showClear
            className="w-full"
            placeholder={t("auditLog.placeholders.status")}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <DynamicBreadcrumb
        items={[{ label: t("auditLog.title"), url: "/audit-log" }]}
      />
      <DynamicTable
        title={t("auditLog.title")}
        value={filteredList}
        columns={columns}
        header={header}
        loading={loading}
        first={first}
        rows={rows}
        totalRecords={searchTerm ? filteredList.length : totalRecords}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
        }}
      />

      {showDetails && selectedViewId !== null && (
        <AuditLogDetails
          visible={showDetails}
          auditLogId={selectedViewId}
          onHide={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default AuditLogList;
