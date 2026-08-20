import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import CertificationRequestService from "../../../services/CertificationReques.service";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import StatusTabMenu, { type StatusTabItem } from "../../common/StatusTabMenu";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import { useTranslation } from "react-i18next";

export type InternationalStatus = {
  value: string;
  label: string;
  icon?: string;
};

type Props = {
  title: string;
  statuses: InternationalStatus[];
  menuPath: string;
};

type RequestRow = {
  id: number;
  serialNumber?: string;
  trackingNumber?: string;
  requestType?: string;
  requestStatus: string;
  certificationType?: string;
  certificationScope: "INTERNATIONAL";
  createdDate?: string;
  company?: { companyNameEN?: string; companyNameDR?: string; companyNamePS?: string };
};

export default function InternationalRequestList({ title, statuses, menuPath }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [data, setData] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentStatus = statuses[activeIndex]?.value || statuses[0]?.value;

  const loadData = useCallback(async () => {
    if (!currentStatus) return;
    try {
      setLoading(true);
      const response = await CertificationRequestService.getAllPaginatedByStatus(
        currentStatus, first / rows, rows, "id,desc", "INTERNATIONAL",
      );
      setData(response.data?.data || []);
      setTotalRecords(response.data?.totalElements || 0);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: t("internationalRequest.error"),
        detail: t("internationalRequest.loadError"),
      });
    } finally {
      setLoading(false);
    }
  }, [currentStatus, first, rows, t]);

  useEffect(() => { void loadData(); }, [loadData]);

  const language = i18n.language || localStorage.getItem("i18nextLng") || "en";
  const companyName = (row: RequestRow) => {
    if (language === "dr") return row.company?.companyNameDR || row.company?.companyNameEN || "-";
    if (language === "ps") return row.company?.companyNamePS || row.company?.companyNameEN || "-";
    return row.company?.companyNameEN || "-";
  };

  const columns = [
    { field: "serialNumber", header: t("internationalRequest.columns.serialNumber") },
    { field: "trackingNumber", header: t("internationalRequest.columns.trackingNumber") },
    { field: "requestType", header: t("internationalRequest.columns.requestType") },
    { field: "certificationType", header: t("internationalRequest.columns.certificationType") },
    { header: t("internationalRequest.columns.company"), body: companyName },
    { field: "requestStatus", header: t("internationalRequest.columns.status"), body: (row: RequestRow) => t(`internationalRequest.statuses.${row.requestStatus}`, row.requestStatus.replaceAll("_", " ")) },
    { field: "createdDate", header: t("internationalRequest.columns.createdDate"), body: (row: RequestRow) => row.createdDate ? IslamicDateFormatter.formatQamari(row.createdDate, true) : "-" },
    {
      header: t("internationalRequest.columns.action"),
      body: (row: RequestRow) => (
        <Button
          icon="pi pi-eye"
          label={t("internationalRequest.view")}
          text
          onClick={() => navigate(`/international-certification-request/view/${row.id}`, {
            state: { originPath: menuPath, activeSidebarPath: menuPath },
          })}
        />
      ),
    },
  ];

  const tabs: StatusTabItem[] = statuses.map(status => ({
    label: t(`internationalRequest.statuses.${status.value}`, status.label),
    value: status.value,
    icon: status.icon || "pi pi-circle",
  }));

  return (
    <>
      <Toast ref={toast} />
      <DynamicBreadcrumb items={[
        { label: t("internationalRequest.management"), url: "/international-requst-management" },
        { label: t(title, title), url: "" },
      ]} />
      <StatusTabMenu
        items={tabs}
        activeIndex={activeIndex}
        onChange={(index) => { setActiveIndex(index); setFirst(0); }}
      />
      <DynamicTable
        title={t(title, title)}
        value={data}
        columns={columns}
        loading={loading}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={(event) => { setFirst(event.first); setRows(event.rows); }}
        header={<div className="flex justify-between"><h2 className="text-xl font-semibold">{t(title, title)}</h2><Button icon="pi pi-refresh" label={t("internationalRequest.refresh")} text onClick={loadData} /></div>}
      />
    </>
  );
}
