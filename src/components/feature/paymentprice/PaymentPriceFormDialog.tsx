import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import PaymentPriceService from "../../../services/paymentPrice.service";

interface Props { visible: boolean; paymentPriceId: number | null; onClose: () => void; onSuccess: () => void; }
const emptyForm = { price: null as number | null, isActive: true };

const PaymentPriceFormDialog: React.FC<Props> = ({ visible, paymentPriceId, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(paymentPriceId);

  useEffect(() => {
    if (!visible) return;
    if (!paymentPriceId) { setForm(emptyForm); return; }
    setLoading(true);
    handleApi(() => PaymentPriceService.getById(paymentPriceId), () => {}, showError, t)
      .then((response: any) => {
        const data = response?.data?.data || response?.data;
        if (data) setForm({ price: Number(data.price), isActive: Boolean(data.active ?? data.isActive) });
      }).finally(() => setLoading(false));
  }, [visible, paymentPriceId, showError, t]);

  const submit = async () => {
    if (form.price === null || form.price <= 0) {
      showError(t("common.error"), t("paymentPrice.validation.priceRequired"));
      return;
    }
    setSaving(true);
    const payload = { price: form.price, active: form.isActive };
    const response = await handleApi(
      () => isEdit && paymentPriceId ? PaymentPriceService.update(paymentPriceId, payload) : PaymentPriceService.create(payload),
      () => showSuccess(t("common.success"), t(isEdit ? "paymentPrice.updateSuccess" : "paymentPrice.createSuccess")),
      showError, t,
    );
    setSaving(false);
    if (response) onSuccess();
  };

  return <Dialog visible={visible} onHide={onClose} header={t(isEdit ? "paymentPrice.editTitle" : "paymentPrice.createTitle")} style={{ width: "95vw", maxWidth: "600px" }} modal draggable={false} resizable={false}>
    {loading ? <div className="py-8 text-center text-gray-500">{t("common.loading")}</div> : <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">{t("paymentPrice.price")} <span className="text-red-500">*</span></label>
        <InputNumber value={form.price} onValueChange={(e) => setForm((p) => ({ ...p, price: e.value ?? null }))} mode="decimal" min={0.01} minFractionDigits={0} maxFractionDigits={2} className="w-full" inputClassName="w-full" />
      </div>
      <div className="flex items-center gap-3"><InputSwitch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: Boolean(e.value) }))} /><span className="text-sm font-medium">{t("paymentPrice.active")}</span></div>
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200"><Button label={t("common.cancel")} outlined onClick={onClose} disabled={saving} /><Button label={t(isEdit ? "common.update" : "common.save")} onClick={submit} loading={saving} /></div>
    </div>}
  </Dialog>;
};
export default PaymentPriceFormDialog;
