import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import InternationalPartyService from "../../../services/internationalparty.service";
import FileUploadField from "../../common/FileUploadField";

interface InternationalPartyForm {
  name: string;
  shortName: string;
  location: string;
  logo: string;
  about: string;
  websiteUrl: string;
  email: string;
  phoneNumber: string;
  organizationType: string;
  isActive: boolean;
}

interface Props {
  visible: boolean;
  internationalPartyId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const createEmptyForm = (): InternationalPartyForm => ({
  name: "",
  shortName: "",
  location: "",
  logo: "",
  about: "",
  websiteUrl: "",
  email: "",
  phoneNumber: "",
  organizationType: "",
  isActive: true,
});

export const InternationalPartyFormDialog: React.FC<Props> = ({
  visible,
  internationalPartyId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InternationalPartyForm>(createEmptyForm());
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  const isEdit = Boolean(internationalPartyId);
  const existingLogoSrc = form.logo?.trim() || "";
  const hasExistingLogo =
    !!existingLogoSrc &&
    (existingLogoSrc.startsWith("http://") ||
      existingLogoSrc.startsWith("https://") ||
      existingLogoSrc.startsWith("/") ||
      existingLogoSrc.startsWith("data:image/"));

  useEffect(() => {
    if (!visible) return;

    if (!internationalPartyId) {
      setForm(createEmptyForm());
      setSelectedLogoFile(null);
      return;
    }

    const loadById = async () => {
      setLoading(true);
      const response = await handleApi(
        () =>
          InternationalPartyService.getInternationalPartyById(
            internationalPartyId,
          ),
        () => {},
        showError,
        t,
      );

      if (response) {
        const data = response.data?.data || response.data;
        setForm({
          name: data?.name || "",
          shortName: data?.shortName || "",
          location: data?.location || "",
          logo: data?.logo || "",
          about: data?.about || "",
          websiteUrl: data?.websiteUrl || "",
          email: data?.email || "",
          phoneNumber: data?.phoneNumber || "",
          organizationType: data?.organizationType || "",
          isActive: Boolean(data?.isActive),
        });
        setSelectedLogoFile(null);
      }

      setLoading(false);
    };

    loadById();
  }, [internationalPartyId, showError, t, visible]);

  const validateForm = () => {
    if (!form.name.trim()) {
      showError(
        t("common.error"),
        t("internationalParty.validation.nameRequired"),
      );
      return false;
    }
    if (!form.location.trim()) {
      showError(
        t("common.error"),
        t("internationalParty.validation.locationRequired"),
      );
      return false;
    }
    if (!form.about.trim()) {
      showError(
        t("common.error"),
        t("internationalParty.validation.aboutRequired"),
      );
      return false;
    }
    if (form.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.email.trim())) {
        showError(
          t("common.error"),
          t("internationalParty.validation.emailInvalid"),
        );
        return false;
      }
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim() || null,
      location: form.location.trim(),
      logo: selectedLogoFile?.name || form.logo.trim() || null,
      about: form.about.trim(),
      websiteUrl: form.websiteUrl.trim() || null,
      email: form.email.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      organizationType: form.organizationType.trim() || null,
      isActive: form.isActive,
    };

    const response = await handleApi(
      () =>
        isEdit && internationalPartyId
          ? InternationalPartyService.updateInternationalParty(
              internationalPartyId,
              payload,
            )
          : InternationalPartyService.createInternationalParty(payload),
      () =>
        showSuccess(
          t("common.success"),
          isEdit
            ? t("internationalParty.updateSuccess")
            : t("internationalParty.createSuccess"),
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
      header={
        isEdit
          ? t("internationalParty.editTitle")
          : t("internationalParty.createTitle")
      }
      style={{ width: "98vw", maxWidth: "1320px" }}
      modal
      draggable={false}
      resizable={false}
    >
      {loading ? (
        <div className="py-8 text-center text-gray-500">
          {t("common.loading")}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("internationalParty.fields.name")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <InputText
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
                placeholder={t("internationalParty.placeholders.name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("internationalParty.fields.location")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <InputText
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full"
                placeholder={t("internationalParty.placeholders.location")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("internationalParty.fields.email")}
              </label>
              <InputText
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full"
                placeholder={t("internationalParty.placeholders.email")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("internationalParty.fields.phoneNumber")}
              </label>
              <InputText
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                className="w-full"
                placeholder={t("internationalParty.placeholders.phoneNumber")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("internationalParty.fields.websiteUrl")}
              </label>
              <InputText
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))
                }
                className="w-full"
                placeholder={t("internationalParty.placeholders.websiteUrl")}
              />
            </div> 
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("internationalParty.fields.about")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <InputTextarea
                value={form.about}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, about: e.target.value }))
                }
                rows={12}
                className="w-full"
                placeholder={t("internationalParty.placeholders.about")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("internationalParty.fields.logo")}
              </label>
              {!selectedLogoFile && hasExistingLogo && (
                <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    {t("internationalParty.currentLogo")}
                  </p>
                  <img
                    src={existingLogoSrc}
                    alt={t("internationalParty.fields.logo")}
                    className="h-28 w-full rounded-md object-contain bg-white"
                  />
                </div>
              )}
              <FileUploadField
                name="internationalPartyLogo"
                accept="image/*"
                maxFileSize={1048576}
                onFileSelect={setSelectedLogoFile}
              />
              {!selectedLogoFile && form.logo && !hasExistingLogo && (
                <p className="text-xs text-gray-500 mt-2 break-all">
                  {t("internationalParty.currentLogo")}: {form.logo}
                </p>
              )}
            </div>
          </div>

          {/* <div className="flex items-center gap-3">
            <InputSwitch
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: Boolean(e.value) }))}
            />
            <span className="text-sm font-medium">{t("internationalParty.activeLabel")}</span>
          </div> */}

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

export default InternationalPartyFormDialog;
