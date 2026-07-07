import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Search, Building2, FileSearch } from "lucide-react";
import { DynamicTable } from "../../common/DynamicTable";
import CertificationRequestService from "../../../services/CertificationReques.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import i18n from "../../../i18n/i18n";

type CertificationRequestRow = {
  id: number;
  serialNumber?: string;
  trackingNumber?: string;
  requestType?: string;
  requestStatus?: string;
  createdDate?: string;
  company?: {
    companyNameEN?: string;
    companyNameDR?: string;
    companyNamePS?: string;
  };
};

export const CertificationRequestTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTracking = (searchParams.get("tracking") || "").trim();
  const initialCompanyName = (searchParams.get("companyName") || "").trim();

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [submittedTracking, setSubmittedTracking] = useState(initialTracking);
  const [submittedCompanyName, setSubmittedCompanyName] =
    useState(initialCompanyName);

  const [data, setData] = useState<CertificationRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const hasActiveSearch = Boolean(submittedTracking || submittedCompanyName);

  const getCompanyName = (row: CertificationRequestRow) => {
    const language = i18n.language;
    if (language === "dr") return row.company?.companyNameDR || "-";
    if (language === "ps") return row.company?.companyNamePS || "-";
    return row.company?.companyNameEN || "-";
  };

  const getStatusSeverity = (status?: string) => {
    switch (status) {
      case "SUBMITTED":
        return "info";
      case "UNDER_REVIEW":
      case "DEADLINE_REQUIRED":
      case "DEADLINE_ASSIGNED":
      case "INSPECTION_IN_PROGRESS":
      case "PAYMENT_PENDING":
        return "warning";
      case "REPORT_APPROVED":
      case "PAYMENT_COMPLETED":
      case "CERTIFICATE_ISSUED":
        return "success";
      case "REJECTED":
      case "CANCELLED":
        return "danger";
      default:
        return "secondary";
    }
  };

  const updateUrl = (nextTracking: string, nextCompanyName: string) => {
    const nextParams = new URLSearchParams();

    if (nextTracking) nextParams.set("tracking", nextTracking);
    if (nextCompanyName) nextParams.set("companyName", nextCompanyName);

    setSearchParams(nextParams);
  };

  const runSearch = () => {
    const nextTracking = trackingNumber.trim();
    const nextCompanyName = companyName.trim();

    setSubmittedTracking(nextTracking);
    setSubmittedCompanyName(nextCompanyName);
    setFirst(0);
    updateUrl(nextTracking, nextCompanyName);
  };

  const clearSearch = () => {
    setTrackingNumber("");
    setCompanyName("");
    setSubmittedTracking("");
    setSubmittedCompanyName("");
    setData([]);
    setTotalRecords(0);
    setFirst(0);
    setSearchParams({});
  };

  const loadData = async () => {
    if (!submittedTracking && !submittedCompanyName) {
      setData([]);
      setTotalRecords(0);
      return;
    }

    try {
      setLoading(true);
      const response =
        await CertificationRequestService.searchCertificationRequest(
          submittedTracking || undefined,
          submittedCompanyName || undefined,
          first / rows,
          rows,
          "id,desc",
        );

      setData(response.data?.data || []);
      setTotalRecords(response.data?.totalElements || 0);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: t("certificationTracking.messages.loadFailed"),
      });
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [submittedTracking, submittedCompanyName, first, rows]);

  const columns = useMemo(
    () => [
      {
        field: "serialNumber",
        header: t("certificationRequest.labels.serialNumber"),
        body: (row: CertificationRequestRow) => row.serialNumber || "-",
      },
      {
        field: "trackingNumber",
        header: t("certificationRequest.labels.trackingNumber"),
        body: (row: CertificationRequestRow) => (
          <span className="font-medium text-blue-700">
            {row.trackingNumber || "-"}
          </span>
        ),
      },
      {
        field: "requestType",
        header: t("certificationRequest.labels.requestType"),
        body: (row: CertificationRequestRow) =>
          row.requestType
            ? t(`certificationRequest.typeOptions.${row.requestType}`)
            : "-",
      },
      {
        field: "requestStatus",
        header: t("certificationRequest.labels.requestStatus"),
        body: (row: CertificationRequestRow) =>
          row.requestStatus ? (
            <Tag
              value={t(
                `certificationRequest.statusOptions.${row.requestStatus}`,
              )}
              severity={getStatusSeverity(row.requestStatus)}
            />
          ) : (
            "-"
          ),
      },
      {
        header: t("company.labels.companyName"),
        body: (row: CertificationRequestRow) => (
          <div className="min-w-[180px] font-medium text-gray-800">
            {getCompanyName(row)}
          </div>
        ),
      },
      {
        field: "createdDate",
        header: t("certificationRequest.labels.createdDate"),
        body: (row: CertificationRequestRow) =>
          row.createdDate
            ? IslamicDateFormatter.formatQamari(row.createdDate, true)
            : "-",
      },
      {
        header: t("common.action"),
        body: (row: CertificationRequestRow) => (
          <div className="flex justify-center">
            <Button
              icon="pi pi-eye"
              label={t("common.view")}
              onClick={() => navigate(`/certification-request/view/${row.id}`)}
              size="small"
            />
          </div>
        ),
      },
    ],
    [navigate, t],
  );

  const header = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {t("certificationTracking.tableTitle")}
        </h2>
        <p className="text-sm text-gray-500">
          {hasActiveSearch
            ? t("certificationTracking.searchSummary", {
                trackingNumber:
                  submittedTracking || t("certificationTracking.notProvided"),
                companyName:
                  submittedCompanyName ||
                  t("certificationTracking.notProvided"),
              })
            : t("certificationTracking.tableHint")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* <Button
          icon="pi pi-refresh"
          label={t("common.refresh")}
          onClick={loadData}
          text
          disabled={!hasActiveSearch}
        /> */}
        {/* <Button
          icon="pi pi-times"
          label={t("common.clear")}
          outlined
          onClick={clearSearch}
          disabled={!trackingNumber && !companyName && !hasActiveSearch}
        /> */}
      </div>
    </div>
  );

  return (
    <div className=" bg-linear-to-b from-slate-50 via-white to-slate-100 pt-5 pb-10">
      <Toast ref={toast} />

      <div className="px-5 max-w-8xl mx-auto mb-6">
        <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                <FileSearch className="h-4 w-4" />
                {t("certificationTracking.badge")}
              </div>
              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900">
                {t("certificationTracking.title")}
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-600">
                {t("certificationTracking.description")}
              </p>
            </div>

            <div className="grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <InputText
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                  }}
                  placeholder={t("certificationTracking.placeholders.tracking")}
                  className="w-full rounded-xl border-slate-200 pl-10"
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Building2 className="h-4 w-4" />
                </span>
                <InputText
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                  }}
                  placeholder={t("certificationTracking.placeholders.company")}
                  className="w-full rounded-xl border-slate-200 pl-10"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {t("certificationTracking.helper")}
                </p>

                <div className="flex gap-2">
                  <Button
                    icon="pi pi-search"
                    label={t("common.search")}
                    onClick={runSearch}
                    disabled={!trackingNumber.trim() && !companyName.trim()}
                  />
                  <Button
                    icon="pi pi-times"
                    label={t("common.clear")}
                    outlined
                    onClick={clearSearch}
                    disabled={
                      !trackingNumber && !companyName && !hasActiveSearch
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!hasActiveSearch ? (
        <div className="px-5 max-w-8xl mx-auto">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FileSearch className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">
              {t("certificationTracking.emptyInitialTitle")}
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-500">
              {t("certificationTracking.emptyInitialDescription")}
            </p>
          </div>
        </div>
      ) : (
        <DynamicTable
          title={t("certificationTracking.tableTitle")}
          value={data}
          columns={columns}
          header={header}
          loading={loading}
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={(e) => {
            setFirst(e.first);
            setRows(e.rows);
          }}
        />
      )}
    </div>
  );
};

export default CertificationRequestTracking;
