import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useTranslation } from "react-i18next";
import CompanyService from "../../../services/company.service";
import BlacklistedCompanyDialog from "./BlacklistedCompanyDialog";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import i18n from "../../../i18n/i18n";

export default function BlacklistedCompanyList() {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await CompanyService.getBlacklistedCompanies({ page: first / rows, size: rows, sort: "id,desc" });
      setCompanies(response.data.data || []);
      setTotalRecords(response.data.totalElements || 0);
    } catch {
      toast.current?.show({ severity: "error", summary: t("common.error"), detail: t("company.loadFailed"), life: 3000 });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCompanies(); }, [first, rows]);

  const getName = (row: any) => {
    const name = i18n.language === "dr" ? row.companyNameDR : i18n.language === "ps" ? row.companyNamePS : row.companyNameEN;
    return name || row.companyNameEN || row.companyNameDR || row.companyNamePS || t("common.notSpecified");
  };

  const columns = [
    { field: "id", header: t("common.id"), style: { width: "80px" }, body: (row: any) => <span>{row.id}</span> },
    { field: "companyName", header: t("company.labels.companyName"), style: { minWidth: "220px" }, body: (row: any) => <span className="font-semibold">{getName(row)}</span> },
    { field: "email", header: t("company.labels.email"), style: { minWidth: "220px" }, body: (row: any) => <span>{row.email || t("common.notSpecified")}</span> },
    { field: "phoneNumber", header: t("company.labels.phoneNumber"), style: { minWidth: "160px" }, body: (row: any) => <span>{row.phoneNumber || t("common.notSpecified")}</span> },
    { field: "companyType", header: t("company.labels.companyType"), style: { minWidth: "160px" }, body: (row: any) => <span>{row.companyType?.replace(/_/g, " ") || t("common.notSpecified")}</span> },
    { field: "address", header: t("company.labels.address"), style: { minWidth: "220px" }, body: (row: any) => <span>{row.address || t("common.notSpecified")}</span> },
    { field: "classificationReason", header: t("company.classification.reason"), style: { minWidth: "240px" }, body: (row: any) => <span className="text-indigo-700">{row.classificationReason || t("common.notSpecified")}</span> },
  ];

  const header = () => <div className="mb-4 flex flex-col items-center justify-between gap-4 px-2 md:flex-row">
    <div className="flex items-center gap-3"><h2 className="text-2xl font-bold">{t("company.classification.blacklistTitle")}</h2><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 shadow-sm">{totalRecords} {t("common.total")}</span></div>
    <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto"><Button icon="pi pi-ban" label={t("company.classificationCreateBlacklist")} severity="danger" text raised onClick={() => setShowCreate(true)} /><Button icon="pi pi-sync" label={t("common.refresh")} text raised severity="info" onClick={loadCompanies} /></div>
  </div>;

  return <><Toast ref={toast} /><DynamicBreadcrumb items={[{ label: t("company.classification.blacklistTitle"), url: "" }]} size="pl-5 pr-5 max-w-8xl mx-auto mt-3" /><DynamicTable title={t("company.classification.blacklistTitle")} value={companies} columns={columns} header={header()} loading={loading} first={first} rows={rows} totalRecords={totalRecords} onPage={(event) => { setFirst(event.first); setRows(event.rows); }} /><BlacklistedCompanyDialog visible={showCreate} onHide={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); loadCompanies(); }} /></>;
}
