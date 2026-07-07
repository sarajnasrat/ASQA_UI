import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import AuditLogService from "../../../services/auditlog.service";
import { DynamicTable } from "../../common/DynamicTable";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

type AuditLogDetailsProps = {
  visible?: boolean;
  auditLogId?: number | null;
  onHide?: () => void;
};

type AuditLogData = {
  id: number;
  username?: string | null;
  fullName?: string | null;
  roleName?: string | null;
  entityName?: string | null;
  action?: string | null;
  status?: string | null;
  createdAt?: string | null;
  details?: Array<{
    id: number;
    fieldName?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
    createdAt?: string | null;
  }>;
};

const TruncatableText = ({
  text,
  emptyLabel,
  showMoreLabel,
  showLessLabel,
}: {
  text?: string | null;
  emptyLabel: string;
  showMoreLabel: string;
  showLessLabel: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const value = text?.trim() || "";
  const needsTruncation = value.length > 200;
  const displayValue =
    !needsTruncation || expanded ? value : `${value.slice(0, 200).trimEnd()}...`;

  if (!value) {
    return <span className="text-gray-500">{emptyLabel}</span>;
  }

  return (
    <div className="whitespace-normal break-words">
      <div>{displayValue}</div>
      {needsTruncation ? (
        <button
          type="button"
          className="mt-1 text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </div>
  );
};

const getDisplayValue = (value?: string | number | null) =>
  value === undefined || value === null || `${value}`.trim() === ""
    ? "-"
    : `${value}`;

const AuditLogDetails = ({
  visible = false,
  auditLogId,
  onHide,
}: AuditLogDetailsProps) => {
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AuditLogData | null>(null);
  const [detailsFirst, setDetailsFirst] = useState(0);
  const [detailsRows, setDetailsRows] = useState(5);

  useEffect(() => {
    if (!visible || !auditLogId) return;

    const loadData = async () => {
      setLoading(true);
      const response = await handleApi(
        () => AuditLogService.getAuditLogById(auditLogId),
        () => {},
        showError,
        t,
      );

      if (response) {
        setData(response.data?.data || response.data);
      }
      setLoading(false);
    };

    loadData();
  }, [visible, auditLogId, showError, t]);

  if (!visible) return null;

  const handleHide = () => {
    if (onHide) {
      onHide();
    }
  };

  const detailList = data?.details || [];

  const detailColumns = [
    { field: "fieldName", header: t("auditLog.columns.field") },
    {
      field: "oldValue",
      header: t("auditLog.columns.oldValue"),
      body: (row: any) => (
        <div className="max-w-[320px]">
          <TruncatableText
            text={row.oldValue}
            emptyLabel={t("common.notSpecified")}
            showMoreLabel={t("auditLog.showMore")}
            showLessLabel={t("auditLog.showLess")}
          />
        </div>
      ),
    },
    {
      field: "newValue",
      header: t("auditLog.columns.newValue"),
      body: (row: any) => (
        <div className="max-w-[320px]">
          <TruncatableText
            text={row.newValue}
            emptyLabel={t("common.notSpecified")}
            showMoreLabel={t("auditLog.showMore")}
            showLessLabel={t("auditLog.showLess")}
          />
        </div>
      ),
    },
    {
      field: "createdAt",
      header: t("common.createdDate"),
      body: (row: any) =>
        row.createdAt
          ? IslamicDateFormatter.formatQamari(row.createdAt, true)
          : t("common.notSpecified"),
    },
  ];

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {t("auditLog.detailsTitle")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("auditLog.detailsDescription")}
          </p>
        </div>
      }
      style={{ width: "95vw", maxWidth: "980px" }}
      modal
      draggable={false}
      resizable={false}
      contentClassName="overflow-hidden"
    >
      {loading ? (
        <div className="py-12 text-center text-gray-600">
          <p>{t("common.loading")}</p>
        </div>
      ) : !data ? (
        <div className="py-12 text-center text-red-600">
          <p>{t("auditLog.notFound")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <span>
                <span className="font-medium text-gray-500">{t("common.id")}:</span>{" "}
                {getDisplayValue(data.id)}
              </span>
              <span>
                <span className="font-medium text-gray-500">
                  {t("auditLog.columns.user")}:
                </span>{" "}
                {getDisplayValue(data.fullName)}
              </span>
              <span>
                <span className="font-medium text-gray-500">
                  {t("auditLog.columns.userEmail")}:
                </span>{" "}
                {getDisplayValue(data.username)}
              </span>
              <span>
                <span className="font-medium text-gray-500">
                  {t("auditLog.columns.role")}:
                </span>{" "}
                {getDisplayValue(data.roleName)}
              </span>
              <span>
                <span className="font-medium text-gray-500">
                  {t("auditLog.columns.entity")}:
                </span>{" "}
                {getDisplayValue(data.entityName)}
              </span>
              <span>
                <span className="font-medium text-gray-500">
                  {t("auditLog.columns.action")}:
                </span>{" "}
                {getDisplayValue(data.action)}
              </span>
              <span>
                <span className="font-medium text-gray-500">
                  {t("common.createdDate")}:
                </span>{" "}
                {data.createdAt
                  ? IslamicDateFormatter.formatQamari(data.createdAt, true)
                  : t("common.notSpecified")}
              </span>
            </div>
          </div>

          {detailList.length > 0 ? (
            <DynamicTable
              title={t("auditLog.detailListTitle")}
              value={detailList}
              columns={detailColumns}
              header={null}
              loading={false}
              first={detailsFirst}
              rows={detailsRows}
              totalRecords={detailList.length}
              onPage={(e) => {
                setDetailsFirst(e.first);
                setDetailsRows(e.rows);
              }}
              rowsPerPageOptions={[5, 10, 20]}
            />
          ) : null}
        </div>
      )}
    </Dialog>
  );
};

export default AuditLogDetails;
