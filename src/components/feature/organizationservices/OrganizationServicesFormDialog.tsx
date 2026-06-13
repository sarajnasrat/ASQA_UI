import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Editor, type EditorTextChangeEvent } from "primereact/editor";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import OrganizationServicesService from "../../../services/organizationservices.service";

interface OrganizationServicesForm {
  name: string;
  service: string;
  isActive: boolean;
}

interface Props {
  visible: boolean;
  organizationId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const createEmptyForm = (): OrganizationServicesForm => ({
  name: "",
  service: "",
  isActive: true,
});

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const OrganizationServicesFormDialog: React.FC<Props> = ({
  visible,
  organizationId,
  onClose,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OrganizationServicesForm>(createEmptyForm());
  const isRtl = i18n.language === "ps" || i18n.language === "dr";
  const editorHeader = (
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1">Heading</option>
        <option value="2">Subheading</option>
        <option value="">Normal</option>
      </select>
      <button className="ql-bold" aria-label="Bold" />
      <button className="ql-italic" aria-label="Italic" />
      <button className="ql-underline" aria-label="Underline" />
      <button className="ql-list" value="ordered" aria-label="Ordered List" />
      <button className="ql-list" value="bullet" aria-label="Bullet List" />
      <button className="ql-link" aria-label="Insert Link" />
      <button className="ql-clean" aria-label="Clear Formatting" />
    </span>
  );

  const isEdit = Boolean(organizationId);

  useEffect(() => {
    if (!visible) return;

    if (!organizationId) {
      setForm(createEmptyForm());
      return;
    }

    const loadById = async () => {
      setLoading(true);
      const response = await handleApi(
        () => OrganizationServicesService.getOrganizationById(organizationId),
        () => {},
        showError,
        t,
      );

      if (response) {
        const data = response.data?.data || response.data;
        setForm({
          name: data?.name || "",
          service: data?.service || "",
          isActive: Boolean(data?.isActive),
        });
      }

      setLoading(false);
    };

    loadById();
  }, [organizationId, showError, t, visible]);

  const validateForm = () => {
    if (!form.name.trim()) {
      showError(t("common.error"), t("organizationServices.validation.nameRequired"));
      return false;
    }
    if (!stripHtml(form.service)) {
      showError(t("common.error"), t("organizationServices.validation.serviceRequired"));
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      service: form.service.trim(),
      isActive: form.isActive,
    };

    const response = await handleApi(
      () =>
        isEdit && organizationId
          ? OrganizationServicesService.updateOrganization(organizationId, payload)
          : OrganizationServicesService.createOrganization(payload),
      () =>
        showSuccess(
          t("common.success"),
          isEdit
            ? t("organizationServices.updateSuccess")
            : t("organizationServices.createSuccess"),
        ),
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
      header={isEdit ? t("organizationServices.editTitle") : t("organizationServices.createTitle")}
      style={{ width: "95vw", maxWidth: "760px" }}
      modal
      draggable={false}
      resizable={false}
    >
      {loading ? (
        <div className="py-8 text-center text-gray-500">{t("common.loading")}</div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("organizationServices.fields.name")} <span className="text-red-500">*</span>
            </label>
            <InputText
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full"
              placeholder={t("organizationServices.placeholders.name")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("organizationServices.fields.service")} <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <Editor
                value={form.service}
                onTextChange={(e: EditorTextChangeEvent) =>
                  setForm((prev) => ({ ...prev, service: e.htmlValue || "" }))
                }
                headerTemplate={editorHeader}
                style={{ height: "280px" }}
                className={`organization-service-editor ${isRtl ? "rtl-editor" : "ltr-editor"}`}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {t("organizationServices.placeholders.service")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <InputSwitch
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: Boolean(e.value) }))}
            />
            <span className="text-sm font-medium">{t("organizationServices.activeLabel")}</span>
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
      <style>{`
        .organization-service-editor .ql-toolbar {
          border: 0;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          padding: 0.75rem;
        }
        .organization-service-editor .ql-container {
          border: 0;
          font-size: 0.95rem;
          color: #111827;
        }
        .organization-service-editor .ql-editor {
          min-height: 220px;
          line-height: 1.7;
          padding: 1rem;
        }
        .organization-service-editor.rtl-editor .ql-editor,
        .organization-service-editor.rtl-editor .ql-container {
          direction: rtl;
          text-align: right;
        }
        .organization-service-editor.ltr-editor .ql-editor,
        .organization-service-editor.ltr-editor .ql-container {
          direction: ltr;
          text-align: left;
        }
        .organization-service-editor.rtl-editor .ql-picker-label,
        .organization-service-editor.rtl-editor .ql-picker-item {
          direction: rtl;
        }
        .organization-service-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          inset-inline-start: 1rem;
          inset-inline-end: auto;
          text-align: ${isRtl ? "right" : "left"};
          content: "${t("organizationServices.placeholders.service")}";
        }
      `}</style>
    </Dialog>
  );
};

export default OrganizationServicesFormDialog;
