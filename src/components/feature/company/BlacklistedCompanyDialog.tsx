import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";
import CompanyService from "../../../services/company.service";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";

type Props = { visible: boolean; onHide: () => void; onSuccess: () => void };

export default function BlacklistedCompanyDialog({ visible, onHide, onSuccess }: Props) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState({ companyNameEN: "", companyNameDR: "", companyNamePS: "", email: "", phoneNumber: "", companyType: "PRIVATE", address: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const types = ["PRIVATE", "PUBLIC", "GOVERNMENT", "NGO", "CORPORATION", "OTHER"].map(value => ({ label: value.replaceAll("_", " "), value }));
  const update = (field: string, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = async () => {
    if (!form.email || !form.phoneNumber || !form.companyType || !form.address || !form.reason || (!form.companyNameEN && !form.companyNameDR && !form.companyNamePS)) return;
    setSaving(true);
    try {
      const response = await handleApi(
        () => CompanyService.registerBlacklistedCompany(form),
        showSuccess,
        showError,
        t,
      );
      if (response) {
        onHide();
        onSuccess();
        setForm({ companyNameEN: "", companyNameDR: "", companyNamePS: "", email: "", phoneNumber: "", companyType: "PRIVATE", address: "", reason: "" });
      }
    }
    finally { setSaving(false); }
  };
  return <Dialog header={t("company.classification.blacklistTitle")} visible={visible} onHide={onHide} modal className="w-full max-w-3xl rounded-2xl overflow-hidden">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(["companyNameEN", "companyNameDR", "companyNamePS", "email", "phoneNumber", "address"] as const).map(field => <div key={field}>
        <label className="mb-1 block font-medium">{t(`company.labels.${field}`)} *</label>
        {field === "address" ? <InputTextarea value={form[field]} onChange={e => update(field, e.target.value)} rows={2} className="w-full" placeholder={t(`company.placeholder.${field}`)} /> : <InputText type={field === "email" ? "email" : "text"} value={form[field]} onChange={e => update(field, e.target.value)} className="w-full" placeholder={t(`company.placeholder.${field}`)} />}
      </div>)}
      <div><label className="mb-1 block font-medium">{t("company.labels.companyType")} *</label><Dropdown value={form.companyType} options={types} onChange={e => update("companyType", e.value)} className="w-full" /></div>
      <div className="md:col-span-2"><label className="mb-1 block font-medium">{t("company.classification.reason")} *</label><InputTextarea value={form.reason} onChange={e => update("reason", e.target.value)} rows={3} className="w-full" placeholder={t("company.classificationReasonPlaceholder")} /></div>
    </div>
    <div className="mt-5 flex justify-end gap-2"><Button label={t("common.cancel")} text onClick={onHide} /><Button label={t("company.classification.blacklistButton")} severity="danger" loading={saving} onClick={submit} /></div>
  </Dialog>;
}
