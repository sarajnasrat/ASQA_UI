import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { useTranslation } from "react-i18next";
import { DynamicTable } from "../../common/DynamicTable";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { handleApi } from "../../../hooks/handleApi";
import { useAppToast } from "../../../hooks/useToast";
import { useToast } from "../../../hooks/ToastContext";
import PaymentPriceService from "../../../services/paymentPrice.service";
import PaymentPriceFormDialog from "./PaymentPriceFormDialog";

const PaymentPriceList: React.FC = () => {
  const { t } = useTranslation(); const { toast, showToast } = useAppToast(); const { showError } = useToast();
  const [list, setList] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [first, setFirst] = useState(0); const [rows, setRows] = useState(10); const [total, setTotal] = useState(0); const [dialog, setDialog] = useState(false); const [selectedId, setSelectedId] = useState<number | null>(null);
  const loadData = async () => { setLoading(true); const response = await handleApi(() => PaymentPriceService.getAll({ page: first / rows, size: rows, sort: "id,desc" }), () => {}, showError, t); if (response) { setList(response.data?.data || []); setTotal(response.data?.totalElements || 0); } setLoading(false); };
  useEffect(() => { loadData(); }, [first, rows]);
  const remove = async (id: number) => { const response = await handleApi(() => PaymentPriceService.delete(id), () => showToast("success", t("common.success"), t("paymentPrice.deleteSuccess")), showError, t); if (response) loadData(); };
  const actions = (row: any) => { const menu = useRef<any>(null); const items: MenuItem[] = [{ label: t("common.edit"), icon: "pi pi-pencil", command: () => { setSelectedId(row.id); setDialog(true); } }, { label: t("common.delete"), icon: "pi pi-trash", command: () => confirmDialog({ message: t("paymentPrice.deleteConfirm"), header: t("common.delete"), icon: "pi pi-exclamation-triangle", acceptLabel: t("common.delete"), rejectLabel: t("common.cancel"), accept: () => remove(row.id) }) }]; return <div className="flex justify-center"><TieredMenu model={items} popup ref={menu} /><Button icon="pi pi-ellipsis-v" text className="p-button-sm" onClick={(e) => menu.current.toggle(e)} /></div>; };
  const columns = [{ field: "id", header: t("paymentPrice.columns.id") }, { field: "price", header: t("paymentPrice.columns.price"), body: (row: any) => Number(row.price).toLocaleString(undefined, { maximumFractionDigits: 2 }) }, { header: t("paymentPrice.columns.status"), body: (row: any) => <Tag value={row.active ?? row.isActive ? t("paymentPrice.active") : t("paymentPrice.inactive")} severity={row.active ?? row.isActive ? "success" : "danger"} /> }, { header: t("common.action"), body: actions, style: { width: "120px" } }];
  const header = <div className="flex flex-col md:flex-row justify-between gap-3"><div><h2 className="text-xl font-semibold text-gray-800">{t("paymentPrice.title")}</h2><p className="text-sm text-gray-500 mt-0.5">{t("paymentPrice.description")}</p></div><div className="flex gap-2"><Button icon="pi pi-plus" label={t("paymentPrice.create")} text raised onClick={() => { setSelectedId(null); setDialog(true); }} /><Button icon="pi pi-refresh" label={t("common.refresh")} text raised onClick={loadData} /></div></div>;
  return <><Toast ref={toast} /><ConfirmDialog /><DynamicBreadcrumb items={[{ label: t("paymentPrice.title"), url: "" }]} /><DynamicTable title={t("paymentPrice.title")} value={list} columns={columns} header={header} loading={loading} first={first} rows={rows} totalRecords={total} onPage={(e) => { setFirst(e.first); setRows(e.rows); }} />{dialog && <PaymentPriceFormDialog visible={dialog} paymentPriceId={selectedId} onClose={() => setDialog(false)} onSuccess={() => { setDialog(false); loadData(); }} />}</>;
};
export default PaymentPriceList;
