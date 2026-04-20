import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";

import AttachmentService from "../../../services/attachment.service";
import CompanyService from "../../../services/company.service";
import { useAppToast } from "../../../hooks/useToast";

import FileUploadField from "../../common/FileUploadField";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { set } from "react-hook-form";

type AttachmentReferenceType = "COMPANY" | "CERTIFICATION" | "USER" | "REQUEST";

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
}

const referenceTypeOptions = [
  { label: "Company", value: "COMPANY" },
  { label: "Standard", value: "STANDARD" },
  { label: "Certification", value: "CERTIFICATION" },
];

export const AttachmentCreate: React.FC<Props> = ({
  referenceId: initialReferenceId,
  referenceType: initialReferenceType,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const { toast, showToast } = useAppToast();

  const [file, setFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");

  const [selectedReferenceType, setSelectedReferenceType] =
    useState<AttachmentReferenceType | null>("CERTIFICATION");

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
    }
  }, [selectedReferenceType]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await CompanyService.getAllCompanies();
      setCompanies(res.data || res);
    } catch {
      showToast("error", t("error"), t("attachment.failed_to_load_companies"));
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
          label: `Request #${r.id}`,
          value: r.id,
        }));

      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      showToast("warn", t("warning"), t("attachment.please_select_file"));
      return;
    }

    if (!attachmentName.trim()) {
      showToast(
        "warn",
        t("warning"),
        t("attachment.please_enter_attachment_name"),
      );
      return;
    }

    if (!selectedReferenceType) {
      showToast(
        "warn",
        t("warning"),
        t("attachment.please_select_attachment_type"),
      );
      return;
    }

    /**
     * ✅ ONLY COMPANY NEEDS referenceId
     */
    if (selectedReferenceType === "COMPANY" && !selectedReferenceId) {
      showToast("warn", t("warning"), t("attachment.please_select_company"));
      return;
    }

    try {
      setLoading(true);

      await AttachmentService.create(
        file,
        attachmentName,
        selectedReferenceId ?? 0, // optional for other types
        selectedReferenceType,
      );

      // reset
      setAttachmentName("");
      setFile(null);
      setSelectedReferenceType(null);
      setSelectedReferenceId(null);

      onSuccess?.();
      if (onSuccess) {
  
          showToast(
            "success",
            t("success"),
            t("attachment.attachment_uploaded_successfully"),
          );
 
      }
      setTimeout(() => {
        navigate("/admin-attachments");
      }, 3000);
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        t("error"),
        t("attachment.failed_to_upload_attachment"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DynamicBreadcrumb
        items={[
          { label: t("attachment.list"), url: "/admin-attachments" },
          { label: t("attachment.add"), url: "/attachment/create" },
        ]}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-1"
      />
      <Toast ref={toast} />

      <div className="flex justify-center pl-5 pr-5 max-w-8xl mx-auto pb-6">
        <Card className="w-full shadow-2">
          <div className="flex flex-col gap-4 p-4">
            {/* TITLE */}
            <div className="flex items-center gap-2">
              <i className="pi pi-paperclip text-blue-600 text-xl" />
              <h3 className="m-0 font-semibold">
                {t("attachment.add_attachment")}
              </h3>
            </div>

            {/* TYPE */}
            <div className="flex flex-col gap-2">
              <label>{t("attachment.attachment_type")} *</label>

              <Dropdown
                value={selectedReferenceType}
                options={referenceTypeOptions.map((o) => ({
                  ...o,
                  label: t(`attachment.${o.value}`),
                }))}
                onChange={(e) => {
                  setSelectedReferenceType(e.value);
                  setSelectedReferenceId(null);
                }}
                placeholder={t("attachment.select_attachment_type")}
                className="w-full"
              />
            </div>

            {/* DYNAMIC REFERENCE */}
            {selectedReferenceType === "COMPANY" && (
              <div className="flex flex-col gap-2">
                <label>{t("attachment.reference")} *</label>

                <Dropdown
                  value={selectedReferenceId}
                  options={getReferenceOptions()}
                  onChange={(e) => setSelectedReferenceId(e.value)}
                  placeholder={t("attachment.select_reference")}
                  loading={loadingCompanies}
                  className="w-full"
                />
              </div>
            )}

            {/* NAME */}
            <div className="flex flex-col gap-2">
              <label>{t("attachment.attachment_name")} *</label>

              <InputText
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder={t("attachment.enter_attachment_name")}
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
            <div className="flex justify-end gap-2">
                              <Button label={t("cancel")} raised text icon="pi pi-times" onClick={(()=> navigate("/admin-attachments"))} />

              <Button
              raised
              text
                label={t("common.save")}
                icon="pi pi-upload"
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
