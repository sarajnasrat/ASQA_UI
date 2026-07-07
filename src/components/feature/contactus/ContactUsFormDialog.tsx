import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import ContactUsService from "../../../services/contactus.service";
import {
  User,
  UserRound,
  Phone,
  Building2,
  Mail,
  Edit3,
  PlusCircle,
  Send,
  X,
} from "lucide-react";

interface ContactUsForm {
  name: string;
  lastName: string;
  phoneNumber: string;
  organization: string;
  email: string;
}

interface Props {
  visible: boolean;
  contactUsId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormFieldProps {
  icon: any;
  label: string;
  required?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  icon: Icon,
  label,
  required,
  placeholder,
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
    {placeholder && <p className="text-xs text-gray-400 mt-1">{placeholder}</p>}
  </div>
);

const defaultForm: ContactUsForm = {
  name: "",
  lastName: "",
  phoneNumber: "",
  organization: "",
  email: "",
};

export const ContactUsFormDialog: React.FC<Props> = ({
  visible,
  contactUsId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContactUsForm>(defaultForm);

  const isEdit = Boolean(contactUsId);

  useEffect(() => {
    if (!visible) return;
    if (!contactUsId) {
      setForm(defaultForm);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const response = await handleApi(
        () => ContactUsService.getContactUsById(contactUsId),
        () => {},
        showError,
        t,
      );
      if (response) {
        const data = response.data?.data || response.data;
        setForm({
          name: data?.name || "",
          lastName: data?.lastName || "",
          phoneNumber: data?.phoneNumber || "",
          organization: data?.organization || "",
          email: data?.email || "",
        });
      }
      setLoading(false);
    };

    loadData();
  }, [contactUsId, showError, t, visible]);

  const validate = () => {
    if (
      !form.name.trim() ||
      !form.lastName.trim() ||
      !form.phoneNumber.trim()
    ) {
      showError(t("common.error"), t("contactUs.validation.namePhoneRequired"));
      return false;
    }
    if (!form.email.trim()) {
      showError(t("common.error"), t("contactUs.validation.emailRequired"));
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      showError(t("common.error"), t("contactUs.validation.invalidEmail"));
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      organization: form.organization.trim() || null,
      email: form.email.trim(),
    };

    const response = await handleApi(
      () =>
        isEdit && contactUsId
          ? ContactUsService.updateContactUs(contactUsId, payload)
          : ContactUsService.createContactUs(payload),
      () =>
        showSuccess(
          t("common.success"),
          isEdit ? t("contactUs.updateSuccess") : t("contactUs.createSuccess"),
        ),
      showError,
      t,
    );

    if (response) {
      onSuccess();
    }

    setSaving(false);
  };

  const renderFooter = () => (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
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
    <div className="flex items-center gap-3 p-4 bg-linear-to-r  border-b border-blue-100">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        {isEdit ? (
          <Edit3 className="h-5 w-5 text-blue-600" />
        ) : (
          <PlusCircle className="h-5 w-5 text-blue-600" />
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          {isEdit ? t("contactUs.editTitle") : t("contactUs.createTitle")}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit
            ? t("contactUs.editDescription")
            : t("contactUs.createDescription")}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={dialogHeader}
      style={{ width: "95vw", maxWidth: "800px" }}
      modal
      draggable={false}
      resizable={false}
      className="contact-us-dialog"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4" />
          <p className="text-gray-500">{t("common.loading")}</p>
        </div>
      ) : (
        <div className="p-2">
          {/* Personal Information Section */}
          <div className="mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField icon={User} label={t("contactUs.name")} required>
                <InputText
                  value={form.name}
                  className="w-full"
                  placeholder={t("contactUs.placeholder.name")}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </FormField>

              <FormField
                icon={UserRound}
                label={t("contactUs.lastName")}
                required
              >
                <InputText
                  value={form.lastName}
                  className="w-full"
                  placeholder={t("contactUs.placeholder.lastName")}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </FormField>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                icon={Phone}
                label={t("contactUs.phoneNumber")}
                required
              >
                <InputText
                  value={form.phoneNumber}
                  className="w-full"
                                  placeholder={t("contactUs.placeholder.phoneNumber")}

                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                />
              </FormField>

              <FormField icon={Mail} label={t("contactUs.email")} required>
                <InputText
                  value={form.email}
                  type="email"
                  className="w-full"
                  placeholder={t("contactUs.placeholder.email")}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </FormField>
            </div>
          </div>

          {/* Organization Information Section */}
          <div className="mb-3">
            <FormField
              icon={Building2}
              label={t("contactUs.organization")}
              placeholder={t("contactUs.placeholder.organization")}
            >
              <InputText
                value={form.organization}
                className="w-full"
                placeholder={t("contactUs.placeholder.organization")}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, organization: e.target.value }))
                }
              />
            </FormField>
          </div>

          {renderFooter()}
        </div>
      )}
    </Dialog>
  );
};

export default ContactUsFormDialog;
