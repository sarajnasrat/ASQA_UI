import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import AboutUsService from "../../../services/aboutus.service";

interface AboutUsForm {
  subject: string;
  about: string;
  isActive: boolean;
}

interface Props {
  visible: boolean;
  aboutUsId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const createEmptyForm = (): AboutUsForm => ({
  subject: "",
  about: "",
  isActive: true,
});

const getString = (...values: any[]) => {
  const candidate = values.find(
    (value) => typeof value === "string" && value.trim() !== "",
  );
  return candidate ?? "";
};

const getBooleanValue = (value: any, alt?: any) => Boolean(value ?? alt);

export const AboutUsFormDialog: React.FC<Props> = ({
  visible,
  aboutUsId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AboutUsForm>(createEmptyForm());

  const isEdit = Boolean(aboutUsId);

  useEffect(() => {
    if (!visible) return;

    if (!aboutUsId) {
      setForm(createEmptyForm());
      return;
    }

    const loadById = async () => {
      setLoading(true);
      const response = await handleApi(
        () => AboutUsService.getAboutUsById(aboutUsId),
        () => {},
        showError,
        t,
      );

      if (response) {
        const data = response.data?.data || response.data;
        setForm({
          subject: getString(data?.subject, data?.name),
          about: getString(data?.about, data?.description, data?.desc),
          isActive: getBooleanValue(data?.isActive, data?.active),
        });
      }

      setLoading(false);
    };

    loadById();
  }, [aboutUsId, showError, t, visible]);

  const validateForm = () => {
    if (!form.subject.trim()) {
      showError(t("common.error"), t("aboutUs.validation.subjectRequired"));
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const payload = {
      subject: form.subject.trim(),
      about: form.about.trim() || null,
      isActive: form.isActive,
    };

    const response = await handleApi(
      () =>
        isEdit && aboutUsId
          ? AboutUsService.updateAboutUs(aboutUsId, payload)
          : AboutUsService.createAboutUs(payload),
      () => showSuccess(t("common.success"), isEdit ? t("aboutUs.updateSuccess") : t("aboutUs.createSuccess")),
      showError,
      t,
    );

    if (response) {
      onSuccess();
    }

    setSaving(false);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={isEdit ? t("aboutUs.editTitle") : t("aboutUs.createTitle")}
      style={{ width: "95vw", maxWidth: "1100px" }}
      modal
      draggable={false}
      resizable={false}
    >
      {loading ? (
        <div className="py-8 text-center text-gray-500">{t("common.loading")}</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("aboutUs.subject")} <span className="text-red-500">*</span>
              </label>
              <InputText
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("aboutUs.about")}
              </label>
              <InputTextarea
                value={form.about}
                onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
                rows={6}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InputSwitch
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: Boolean(e.value) }))}
            />
            <span className="text-sm font-medium">{t("aboutUs.activeLabel")}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button
              type="button"
              label={t("common.cancel")}
              outlined
              onClick={onClose}
              disabled={saving}
            />
            <Button
              type="button"
              label={isEdit ? t("common.update") : t("common.save")}
              onClick={onSubmit}
              loading={saving}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default AboutUsFormDialog;