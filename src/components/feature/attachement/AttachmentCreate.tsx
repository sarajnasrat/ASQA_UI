import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";

import AttachmentService from "../../../services/attachment.service";
import CompanyService from "../../../services/company.service";
import CategoryService from "../../../services/category.service";
import { useAppToast } from "../../../hooks/useToast";

import FileUploadField from "../../common/FileUploadField";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";

type AttachmentReferenceType = "COMPANY" | "STANDARD" | "CERTIFICATION" | "USER" | "REQUEST";

interface Company {
  id: number;
  companyNameEN: string;
  companyNameDR: string;
  companyNamePS: string;
}

interface Props {
  referenceId?: number;
  referenceType?: AttachmentReferenceType;
  onSuccess?: () => void;
  onHide?: () => void;
}

const referenceTypeOptions = [
  { label: "attachment.referenceTypeOptions.COMPANY", value: "COMPANY" },
  { label: "attachment.referenceTypeOptions.STANDARD", value: "STANDARD" },
  { label: "attachment.referenceTypeOptions.CERTIFICATION", value: "CERTIFICATION" },
  { label: "attachment.referenceTypeOptions.USER", value: "USER" },
  { label: "attachment.referenceTypeOptions.REQUEST", value: "REQUEST" },
];

export const AttachmentCreate: React.FC<Props> = ({
  referenceId: initialReferenceId,
  referenceType: initialReferenceType,
  onSuccess,
  onHide,
}) => {
  const { t, i18n } = useTranslation();
  const { toast, showToast } = useAppToast();

  const [file, setFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const { showError, showSuccess } = useToast();
  const [selectedReferenceType, setSelectedReferenceType] =
    useState<AttachmentReferenceType | null>(initialReferenceType || null);

  const [selectedReferenceId, setSelectedReferenceId] = useState<number | null>(
    initialReferenceId || null,
  );

  const [loading, setLoading] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const navigate = useNavigate();
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const getCompanyName = (company: Company) => {
    const lang = i18n.language;

    if (lang === "ps") return company.companyNamePS;
    if (lang === "dr" || lang === "fa") return company.companyNameDR;

    return company.companyNameEN;
  };

  useEffect(() => {
    if (!selectedReferenceType) return;

    switch (selectedReferenceType) {
      case "COMPANY":
        fetchCompanies();
        break;
      case "CERTIFICATION":
        fetchCertifications();
        break;
      case "USER":
        fetchUsers();
        break;
      case "REQUEST":
        fetchRequests();
        break;
      case "STANDARD":
        fetchStandardCategories();
        break;
    }
  }, [selectedReferenceType]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await CompanyService.getAllCompanies();
      setCompanies(res.data || res);
    } catch {
      showToast("error", t("common.error"), t("attachment.failed_to_load_companies"));
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchCertifications = async () => {
    setCertifications([]);
  };

  const fetchUsers = async () => {
    setUsers([]);
  };

  const fetchRequests = async () => {
    setRequests([]);
  };

  const fetchStandardCategories = async () => {
    try {
      const response = await CategoryService.getCategoriesByType("STANDARD");
      setCategories(response.data || []);
    } catch {
      showToast("error", t("common.error"), t("attachment.failed_to_load_categories"));
    }
  };
  const getReferenceOptions = () => {
    switch (selectedReferenceType) {
      case "COMPANY":
        return companies.map((c) => ({
          label: getCompanyName(c),
          value: c.id,
        }));

      case "CERTIFICATION":
        return certifications.map((c) => ({
          label: c.name,
          value: c.id,
        }));

      case "USER":
        return users.map((u) => ({
          label: u.username,
          value: u.id,
        }));

      case "REQUEST":
        return requests.map((r) => ({
          label: `${t("attachment.request")} #${r.id}`,
          value: r.id,
        }));

      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      showToast("warn", t("common.warning"), t("attachment.please_select_file"));
      return;
    }

    if (!attachmentName.trim()) {
      showToast(
        "warn",
        t("common.warning"),
        t("attachment.please_enter_attachment_name"),
      );
      return;
    }

    if (!selectedReferenceType) {
      showToast(
        "warn",
        t("common.warning"),
        t("attachment.please_select_attachment_type"),
      );
      return;
    }

    /**
     * ✅ ONLY COMPANY NEEDS referenceId
     */
    if (selectedReferenceType === "COMPANY" && !selectedReferenceId) {
      showToast("warn", t("common.warning"), t("attachment.please_select_company"));
      return;
    }
    if (selectedReferenceType === "STANDARD" && !selectedCategoryId) {
      showToast("warn", t("common.warning"), t("attachment.select_category"));
      return;
    }

    try {
      setLoading(true);

      const response=await handleApi(
        () =>
          AttachmentService.create(
            file,
            attachmentName,
            selectedReferenceId ?? 0, // optional for other types
            selectedReferenceType,
            selectedReferenceType === "STANDARD" ? selectedCategoryId : null,
          ),
        showSuccess,
        showError,
        t,
      );

      if (response) {
        setAttachmentName("");
        setFile(null);
        setSelectedReferenceType(initialReferenceType || null);
        setSelectedReferenceId(initialReferenceId || null);
        onSuccess?.();
        onHide?.();
      }
 
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        t("common.error"),
        t("attachment.failed_to_upload_attachment"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAttachmentName("");
    setFile(null);
    setSelectedReferenceType(initialReferenceType || null);
    setSelectedReferenceId(initialReferenceId || null);
    onHide?.();
    if (!onHide) navigate("/admin-attachments");
  };

  return (
    <Dialog
      header={t("attachment.add_attachment")}
      visible
      modal
      className="w-full md:w-208 rounded-2xl overflow-hidden"
      style={{ borderRadius: "1rem", overflow: "hidden" }}
      contentClassName="p-0"
      onHide={handleCancel}
    >
      <Toast ref={toast} />

      <div className="bg-slate-50 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-2">
            {/* TITLE */}
      

            {/* TYPE */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">{t("attachment.attachment_type")} <span className="text-red-500">*</span></label>

              <Dropdown
                value={selectedReferenceType}
                options={referenceTypeOptions.map((o) => ({
                  ...o,
                  label: t(o.label),
                }))}
                onChange={(e) => {
                  setSelectedReferenceType(e.value);
                  setSelectedReferenceId(null);
                  setSelectedCategoryId(null);
                }}
                disabled={Boolean(initialReferenceType)}
                placeholder={t("attachment.select_attachment_type")}
                className="w-full"
                showClear={!initialReferenceType}
              />
            </div>

            {/* DYNAMIC REFERENCE */}
            {selectedReferenceType === "STANDARD" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">{t("attachment.category")} <span className="text-red-500">*</span></label>
                <Dropdown value={selectedCategoryId} options={categories.map(category => ({ label: category.name, value: category.id }))} onChange={e => setSelectedCategoryId(e.value)} placeholder={t("attachment.select_category")} className="w-full" filter />
              </div>
            )}
            {selectedReferenceType === "COMPANY" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">{t("attachment.reference")} <span className="text-red-500">*</span></label>

                <Dropdown
                  value={selectedReferenceId}
                  options={getReferenceOptions()}
                  onChange={(e) => setSelectedReferenceId(e.value)}
                  placeholder={t("attachment.select_reference")}
                  loading={loadingCompanies}
                  filter
                  className="w-full"
                />
              </div>
            )}

            {/* NAME */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">{t("attachment.attachment_name")} <span className="text-red-500">*</span></label>

              <InputText
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder={t("attachment.enter_attachment_name")}
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* FILE */}
            <FileUploadField
              label={t("attachment.select_file")}
              name="file"
              accept="image/*,.pdf,.doc,.docx"
              maxFileSize={5242880}
              required
              onFileSelect={(file) => setFile(file)}
            />

            {/* SUBMIT */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <Button
                label={t("common.cancel")}
                raised
                icon="pi pi-times"
                outlined
                severity="secondary"
                onClick={handleCancel}
              />

              <Button
                raised
                label={t("common.save")}
                icon="pi pi-save"
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </div>

      </div>
    </Dialog>
  );
};
