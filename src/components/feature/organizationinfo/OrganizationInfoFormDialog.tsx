import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import OrganizationInfoService from "../../../services/organizationinfo.service";
import {
  Building2,
  Phone,
  MapPin,
  Mail,
  Edit3,
  PlusCircle,
  Globe,
} from "lucide-react";

interface OrganizationInfoForm {
  organizationName: string;
  address: string;
  phoneNumber: string;
  satelliteHorizontal: string;
  satelliteVertical: string;
  emailAddress: string;
}

interface Props {
  visible: boolean;
  organizationInfoId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormFieldProps {
  icon: any;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  icon: Icon,
  label,
  required,
  children,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-500" />
        {label}
        {required && <span className="text-red-500 text-xs ml-1">*</span>}
      </span>
    </label>
    {children}
  </div>
);

const createEmptyForm = (): OrganizationInfoForm => ({
  organizationName: "",
  address: "",
  phoneNumber: "",
  satelliteHorizontal: "",
  satelliteVertical: "",
  emailAddress: "",
});

const OrganizationInfoFormDialog: React.FC<Props> = ({
  visible,
  organizationInfoId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OrganizationInfoForm>(createEmptyForm());

  const isEdit = Boolean(organizationInfoId);

  useEffect(() => {
    if (!visible) return;

    if (!organizationInfoId) {
      setForm(createEmptyForm());
      return;
    }

    const loadOrganizationInfo = async () => {
      setLoading(true);

      const response = await handleApi(
        () => OrganizationInfoService.getOrganizationInfoById(organizationInfoId),
        () => {},
        showError,
        t
      );

      if (response) {
        const data = response.data?.data || response.data;

        setForm({
          organizationName: data.organizationName || "",
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
          satelliteHorizontal: data.satelliteHorizontal || "",
          satelliteVertical: data.satelliteVertical || "",
          emailAddress: data.emailAddress || "",
        });
      }

      setLoading(false);
    };

    loadOrganizationInfo();
  }, [visible, organizationInfoId, showError, t]);

  const validateForm = () => {
    if (!form.organizationName.trim()) {
      showError(
        t("common.error"),
        t("organizationInfo.validation.organizationNameRequired")
      );
      return false;
    }

    if (!form.address.trim()) {
      showError(
        t("common.error"),
        t("organizationInfo.validation.addressRequired")
      );
      return false;
    }

    if (!form.phoneNumber.trim()) {
      showError(
        t("common.error"),
        t("organizationInfo.validation.phoneNumberRequired")
      );
      return false;
    }

    if (!form.satelliteHorizontal.trim()) {
      showError(
        t("common.error"),
        t("organizationInfo.validation.satelliteHorizontalRequired")
      );
      return false;
    }

    if (!form.satelliteVertical.trim()) {
      showError(
        t("common.error"),
        t("organizationInfo.validation.satelliteVerticalRequired")
      );
      return false;
    }

    if (!form.emailAddress.trim()) {
      showError(
        t("common.error"),
        t("organizationInfo.validation.emailAddressRequired")
      );
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.emailAddress.trim())) {
      showError(
        t("common.error"),
        t("organizationInfo.validation.invalidEmail")
      );
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      organizationName: form.organizationName.trim(),
      address: form.address.trim(),
      phoneNumber: form.phoneNumber.trim(),
      satelliteHorizontal: form.satelliteHorizontal.trim(),
      satelliteVertical: form.satelliteVertical.trim(),
      emailAddress: form.emailAddress.trim(),
    };

    const response = await handleApi(
      () =>
        isEdit && organizationInfoId
          ? OrganizationInfoService.updateOrganizationInfo(organizationInfoId, payload)
          : OrganizationInfoService.createOrganizationInfo(payload),
      () =>
        showSuccess(
          t("common.success"),
          isEdit
            ? t("organizationInfo.updateSuccess")
            : t("organizationInfo.createSuccess")
        ),
      showError,
      t
    );

    if (response) {
      onSuccess();
    }

    setSaving(false);
  };

  const renderFooter = () => (
    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
      <Button
        label={t("common.cancel")}
        icon="pi pi-times"
        className="p-button-outlined p-button-secondary"
        onClick={onClose}
        disabled={saving}
      />

      <Button
        label={isEdit ? t("common.update") : t("common.save")}
        icon={isEdit ? "pi pi-save" : "pi pi-check"}
        className="p-button-primary"
        onClick={onSubmit}
        loading={saving}
      />
    </div>
  );

  const dialogHeader = (
    <div className="flex items-center gap-3 p-4 border-b border-blue-100">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        {isEdit ? (
          <Edit3 className="h-5 w-5 text-blue-600" />
        ) : (
          <PlusCircle className="h-5 w-5 text-blue-600" />
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800">
          {isEdit
            ? t("organizationInfo.editTitle")
            : t("organizationInfo.createTitle")}
        </h2>

        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit
            ? t("organizationInfo.editDescription")
            : t("organizationInfo.createDescription")}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={dialogHeader}
      style={{ width: "95vw", maxWidth: "650px" }}
      modal
      draggable={false}
      resizable={false}
      className="organization-info-dialog"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4" />
          <p>{t("common.loading")}</p>
        </div>
      ) : (
        <div className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              icon={Building2}
              label={t("organizationInfo.organizationName")}
              required
            >
              <InputText
                value={form.organizationName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    organizationName: e.target.value,
                  }))
                }
                className="w-full"
                placeholder={t("organizationInfo.placeholder.organizationName")}
              />
            </FormField>

            <FormField
              icon={Phone}
              label={t("organizationInfo.phoneNumber")}
              required
            >
              <InputText
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="w-full"
                placeholder={t("organizationInfo.placeholder.phoneNumber")}
              />
            </FormField>
          </div>

          <FormField
            icon={MapPin}
            label={t("organizationInfo.address")}
            required
          >
            <InputTextarea
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              rows={3}
              className="w-full"
              placeholder={t("organizationInfo.placeholder.address")}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              icon={Globe}
              label={t("organizationInfo.satelliteHorizontal")}
              required
            >
              <InputText
                value={form.satelliteHorizontal}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    satelliteHorizontal: e.target.value,
                  }))
                }
                className="w-full"
                placeholder={t("organizationInfo.placeholder.satelliteHorizontal")}
              />
            </FormField>

            <FormField
              icon={Globe}
              label={t("organizationInfo.satelliteVertical")}
              required
            >
              <InputText
                value={form.satelliteVertical}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    satelliteVertical: e.target.value,
                  }))
                }
                className="w-full"
                placeholder={t("organizationInfo.placeholder.satelliteVertical")}
              />
            </FormField>
          </div>

          <FormField
            icon={Mail}
            label={t("organizationInfo.emailAddress")}
            required
          >
            <InputText
              type="email"
              value={form.emailAddress}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  emailAddress: e.target.value,
                }))
              }
              className="w-full"
              placeholder={t("organizationInfo.placeholder.emailAddress")}
            />
          </FormField>

          {renderFooter()}
        </div>
      )}
    </Dialog>
  );
};

export default OrganizationInfoFormDialog;