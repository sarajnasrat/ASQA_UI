import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Building2, FileSearch, Search } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import CertificationRequestService from "../../../services/CertificationReques.service";
import { DynamicTable } from "../../common/DynamicTable";

type RequestRow = {
  id: number;
  serialNumber?: string;
  trackingNumber?: string;
  requestStatus?: string;
  certificationScope?: "NATIONAL" | "INTERNATIONAL";
  company?: { companyNameEN?: string; companyNameDR?: string; companyNamePS?: string };
};

const ManageCertificationRequest = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tracking, setTracking] = useState(params.get("tracking") || "");
  const [company, setCompany] = useState(params.get("companyName") || "");
  const [submittedTracking, setSubmittedTracking] = useState(params.get("tracking") || "");
  const [submittedCompany, setSubmittedCompany] = useState(params.get("companyName") || "");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const toast = useRef<Toast>(null);

  const companyName = (row: RequestRow) =>
    i18n.language === "dr" ? row.company?.companyNameDR :
      i18n.language === "ps" ? row.company?.companyNamePS : row.company?.companyNameEN;

  useEffect(() => {
    if (!submittedTracking.trim() && !submittedCompany.trim()) {
      setRows([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    CertificationRequestService.searchCertificationRequest(submittedTracking.trim() || undefined, submittedCompany.trim() || undefined, first / pageSize, pageSize, "id,desc")
      .then((response) => {
        setRows(response.data?.data || []);
        setTotal(response.data?.totalElements || 0);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [submittedTracking, submittedCompany, first, pageSize]);

  const search = () => {
    const trackingValue = tracking.trim();
    const companyValue = company.trim();
    setSubmittedTracking(trackingValue);
    setSubmittedCompany(companyValue);
    setFirst(0);
    setParams({ ...(trackingValue ? { tracking: trackingValue } : {}), ...(companyValue ? { companyName: companyValue } : {}) });
  };

  const columns = [
    { field: "serialNumber", header: t("certificationRequest.labels.serialNumber") },
    { field: "trackingNumber", header: t("certificationRequest.labels.trackingNumber") },
    { header: t("company.labels.companyName"), body: (row: RequestRow) => companyName(row) || "-" },
    {
      field: "requestStatus",
      header: t("certificationRequest.labels.requestStatus"),
      body: (row: RequestRow) => row.requestStatus ? <Tag value={t(`certificationRequest.statusOptions.${row.requestStatus}`)} /> : "-",
    },
    {
      header: t("common.action"),
      body: (row: RequestRow) => (
        <Button label={t("common.view")} icon="pi pi-sliders-h" size="small" onClick={() => navigate(`/certification-request/manage/view/${row.id}`)} />
      ),
    },
  ];

  return (
    <div className="bg-linear-to-b from-slate-50 via-white to-slate-100 pt-5 pb-10">
      <Toast ref={toast} />
      <div className="px-5 max-w-8xl mx-auto mb-6">
        <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700"><FileSearch className="h-4 w-4" />{t("certificationRequest.manage.badge")}</div>
              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900">{t("certificationRequest.manage.title")}</h1>
              <p className="mt-3 text-sm md:text-base text-slate-600">{t("certificationRequest.manage.description")}</p>
            </div>
            <div className="grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><InputText value={tracking} onChange={(event) => setTracking(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} placeholder={t("certificationTracking.placeholders.tracking")} className="w-full rounded-xl border-slate-200 pl-10" /></div>
              <div className="relative"><Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><InputText value={company} onChange={(event) => setCompany(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} placeholder={t("certificationTracking.placeholders.company")} className="w-full rounded-xl border-slate-200 pl-10" /></div>
              <div className="md:col-span-2 flex justify-end"><Button label={t("common.search")} icon="pi pi-search" onClick={search} disabled={!tracking.trim() && !company.trim()} /></div>
            </div>
          </div>
        </div>
      </div>
      {!submittedTracking && !submittedCompany ? <div className="px-5 max-w-8xl mx-auto"><div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm"><FileSearch className="mx-auto mb-4 h-8 w-8 text-slate-500" /><h2 className="text-xl font-semibold text-slate-800">{t("certificationRequest.manage.emptyTitle")}</h2><p className="mt-2 text-sm text-slate-500">{t("certificationRequest.manage.emptyDescription")}</p></div></div> : <DynamicTable value={rows} columns={columns} loading={loading} first={first} rows={pageSize} totalRecords={total} onPage={(event) => { setFirst(event.first); setPageSize(event.rows); }} title={t("certificationRequest.manage.title")} />}
    </div>
  );
};

export default ManageCertificationRequest;
