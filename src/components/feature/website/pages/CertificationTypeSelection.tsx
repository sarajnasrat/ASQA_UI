import React, { useEffect, useState } from "react";
import {
  Building2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Award,
} from "lucide-react";
import CertificationRequestService from "../../../../services/CertificationReques.service";
import CompanyService from "../../../../services/company.service";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../../hooks/handleApi";
import { useToast } from "../../../../hooks/ToastContext";

const STORAGE_KEY = "certificationDraft";

interface CertificationTypeSelectionProps {
  onSuccess?: (
    requestType: string,
    mainType: string,
    certificationType: string,
    requestId: number,
    domesticCategory?: string,
    selectedCertificationType?: string,
    renewalCompanyData?: any,
  ) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  setIsSubmitting?: (value: boolean) => void;
  isStandalone?: boolean;
  presetCertificationType?: string;
}

const CertificationTypeSelection: React.FC<CertificationTypeSelectionProps> = ({
  onSuccess,
  onCancel,
  isSubmitting: externalIsSubmitting,
  setIsSubmitting: externalSetIsSubmitting,
  isStandalone = false,
  presetCertificationType,
}) => {
  const [formData, setFormData] = useState({
    certificationType: "",
    domesticCategory: "",
    requestType: "",
    mainType: "",
    jawazNumber: "",
  });

  const [errors, setErrors] = useState({
    certificationType: "",
    domesticCategory: "",
    requestType: "",
    mainType: "",
    jawazNumber: "",
  });
  const [isLookingUpCompany, setIsLookingUpCompany] = useState(false);
  const [renewalCompanyData, setRenewalCompanyData] = useState<any>(null);

  const { showError, showSuccess } = useToast();
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isSubmitting =
    externalIsSubmitting !== undefined
      ? externalIsSubmitting
      : internalIsSubmitting;

  const setIsSubmitting = externalSetIsSubmitting || setInternalIsSubmitting;

  useEffect(() => {
    const state = location.state as { certificationType?: string } | undefined;
    const effectiveCertificationType =
      presetCertificationType || state?.certificationType;
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    const sessionRequestId = sessionStorage.getItem("certificationRequestId");
    const sessionCertificationType =
      sessionStorage.getItem("certificationType");
    const sessionDomesticCategory = sessionStorage.getItem("domesticCategory");
    const sessionMainType = sessionStorage.getItem("certificationMainType");
    const sessionRequestType = sessionStorage.getItem("requestType");

    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      const draftSelectedCertificationType =
        draft.selectedCertificationType || draft.certificationType || "";

      setFormData({
        certificationType:
          effectiveCertificationType || draftSelectedCertificationType,
        domesticCategory:
          effectiveCertificationType === "STANDARD_MARK_CERTIFICATION"
            ? ""
            : draft.domesticCategory || "",
        requestType: draft.requestType || "",
        mainType: draft.certificationMainType || "",
        jawazNumber: draft.jawazNumber || "",
      });
      return;
    }

    if (sessionRequestId && sessionCertificationType) {
      const sessionSelectedCertificationType =
        sessionStorage.getItem("selectedCertificationType") ||
        sessionCertificationType ||
        "";
      const draftToSave = {
        id: parseInt(sessionRequestId, 10),
        certificationType: sessionCertificationType || "",
        selectedCertificationType: sessionSelectedCertificationType,
        domesticCategory: sessionDomesticCategory || "",
        requestType: sessionRequestType || "",
        certificationMainType: sessionMainType || "",
        jawazNumber: sessionStorage.getItem("renewalJawazNumber") || "",
      };

      setFormData({
        certificationType:
          effectiveCertificationType || draftToSave.selectedCertificationType,
        domesticCategory:
          effectiveCertificationType === "STANDARD_MARK_CERTIFICATION"
            ? ""
            : draftToSave.domesticCategory,
        requestType: draftToSave.requestType,
        mainType: draftToSave.certificationMainType,
        jawazNumber: draftToSave.jawazNumber || "",
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
      return;
    }

    if (effectiveCertificationType) {
      setFormData((prev) => ({
        ...prev,
        certificationType: effectiveCertificationType,
        domesticCategory:
          effectiveCertificationType === "STANDARD_MARK_CERTIFICATION"
            ? ""
            : prev.domesticCategory,
      }));
    }
  }, [location.state, presetCertificationType]);

  useEffect(() => {
    if (
      !formData.certificationType &&
      !formData.domesticCategory &&
      !formData.requestType &&
      !formData.mainType
    ) {
      return;
    }

    const savedDraft = localStorage.getItem(STORAGE_KEY);
    const draft = savedDraft ? JSON.parse(savedDraft) : {};

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...draft,
        certificationType: formData.certificationType,
        domesticCategory: formData.domesticCategory,
        requestType: formData.requestType,
        certificationMainType: formData.mainType,
        jawazNumber: formData.jawazNumber,
      }),
    );
  }, [formData]);

  const certificationOptions = [
    {
      value: "DOMESTIC_QUALITY_CERTIFICATION",
      label: t("certification.page.certificationType.domestic.title"),
      description: t(
        "certification.page.certificationType.domestic.description",
      ),
      icon: ShieldCheck,
    },
    {
      value: "STANDARD_MARK_CERTIFICATION",
      label: t("certification.page.certificationType.standard.title"),
      description: t(
        "certification.page.certificationType.standard.description",
      ),
      icon: Award,
    },
  ];

  const domesticCategoryOptions = [
    {
      value: "MANAGEMENT_SYSTEM_QUALITY",
      label: t("certification.page.certificationType.domesticOptions.system"),
    },
    {
      value: "SERVICE_QUALITY",
      label: t("certification.page.certificationType.domesticOptions.services"),
    },
    {
      value: "PRODUCT_QUALITY",
      label: t("certification.page.certificationType.domesticOptions.product"),
    },
  ];

  const requestTypeOptions = [
    { value: "NEW", label: t("certification.page.requestType.new.title") },
    {
      value: "RENEWAL",
      label: t("certification.page.requestType.renewal.title"),
    },
  ];

  const mainTypeOptions = [
    {
      value: "INTERNAL",
      label: t("certification.page.certificationScope.internal.title"),
    },
    {
      value: "EXTERNAL",
      label: t("certification.page.certificationScope.external.title"),
    },
  ];

  const selectedCertification = certificationOptions.find(
    (option) => option.value === formData.certificationType,
  );

  const selectionTitle = selectedCertification
    ? formData.certificationType === "STANDARD_MARK_CERTIFICATION"
      ? t(
          "certification.page.certificationType.standard.requestTitle",
          "Standard Mark Request",
        )
      : t(
          "certification.page.certificationType.domestic.requestTitle",
          "Quality Certification Request",
        )
    : t("certification.page.title");

  const selectionSubtitle = selectedCertification
    ? selectedCertification.description
    : t("certification.page.subtitle");

  const requestTypeLabel = selectedCertification
    ? formData.certificationType === "STANDARD_MARK_CERTIFICATION"
      ? t(
          "certification.page.certificationType.standard.requestTypeLabel",
          "Request Type for Standard Mark",
        )
      : t(
          "certification.page.certificationType.domestic.requestTypeLabel",
          "Request Type for Quality Certification",
        )
    : t("certification.page.requestType.title");

  const certificationScopeLabel = selectedCertification
    ? formData.certificationType === "STANDARD_MARK_CERTIFICATION"
      ? t(
          "certification.page.certificationType.standard.scopeLabel",
          "Certification Scope for Standard Mark",
        )
      : t(
          "certification.page.certificationType.domestic.scopeLabel",
          "Certification Scope for Quality Certification",
        )
    : t("certification.page.certificationScope.title");

  const validateForm = () => {
    const newErrors = {
      certificationType: "",
      domesticCategory: "",
      requestType: "",
      mainType: "",
      jawazNumber: "",
    };

    let isValid = true;

    if (!formData.certificationType) {
      newErrors.certificationType = t(
        "certification.validation.certificationTypeRequired",
      );
      isValid = false;
    }

    if (
      formData.certificationType === "DOMESTIC_QUALITY_CERTIFICATION" &&
      !formData.domesticCategory
    ) {
      newErrors.domesticCategory = t(
        "certification.validation.domesticCategoryRequired",
      );
      isValid = false;
    }

    if (!formData.requestType) {
      newErrors.requestType = t("certification.validation.requestTypeRequired");
      isValid = false;
    }

    if (formData.requestType === "RENEWAL" && !formData.jawazNumber.trim()) {
      newErrors.jawazNumber = t("company.validation.jawazNumber.required");
      isValid = false;
    }

    if (!formData.mainType) {
      newErrors.mainType = t("certification.validation.certificationScope");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateRequest = async () => {
    if (!validateForm()) {
      showError(t("common.validation.fillRequiredFields"));
      return;
    }

    setIsSubmitting(true);
    let fetchedRenewalCompanyData = renewalCompanyData;

    if (formData.requestType === "RENEWAL") {
      setIsLookingUpCompany(true);
      const companyResponse = await handleApi(
        () => CompanyService.getCompanyByJawazNumber(formData.jawazNumber.trim()),
        () => {},
        showError,
        t,
      );
      setIsLookingUpCompany(false);

      if (!companyResponse) {
        setIsSubmitting(false);
        return;
      }

      fetchedRenewalCompanyData =
        companyResponse.data?.data || companyResponse.data || null;
      setRenewalCompanyData(fetchedRenewalCompanyData);
    }

    const requestData = {
      requestType: formData.requestType,
      requestStatus: "DRAFT",
      certificationMainType: formData.mainType,
      certificationType:
        formData.certificationType === "DOMESTIC_QUALITY_CERTIFICATION"
          ? formData.domesticCategory
          : formData.certificationType,
    };

    const actualCertificationType = requestData.certificationType;

    const savedDraft = localStorage.getItem(STORAGE_KEY);
    const draft = savedDraft ? JSON.parse(savedDraft) : null;

    let response;
    let requestId;

    if (draft?.id) {
      response = await handleApi(
        () => CertificationRequestService.update(draft.id, requestData),
        showSuccess,
        showError,
        t,
      );

      if (response) {
        requestId = draft.id;
      }
    } else {
      response = await handleApi(
        () => CertificationRequestService.create(requestData),
        showSuccess,
        showError,
        t,
      );

      if (response) {
        requestId = response.data?.id || response.data?.data?.id;
      }
    }

    if (response && requestId) {
      const draftToSave = {
        id: requestId,
        selectedCertificationType: formData.certificationType,
        certificationType: actualCertificationType,
        domesticCategory: formData.domesticCategory,
        requestType: formData.requestType,
        certificationMainType: formData.mainType,
        jawazNumber: formData.jawazNumber,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
      sessionStorage.setItem("certificationRequestId", String(requestId));
      sessionStorage.setItem("selectedCertificationType", formData.certificationType);
      sessionStorage.setItem("certificationType", actualCertificationType);
      sessionStorage.setItem("domesticCategory", formData.domesticCategory);
      sessionStorage.setItem("certificationMainType", formData.mainType);
      sessionStorage.setItem("requestType", formData.requestType);
      sessionStorage.setItem("renewalJawazNumber", formData.jawazNumber);
      if (fetchedRenewalCompanyData) {
        sessionStorage.setItem(
          "renewalCompanyData",
          JSON.stringify(fetchedRenewalCompanyData),
        );
      }

      if (onSuccess) {
        onSuccess(
          formData.requestType,
          formData.mainType,
          actualCertificationType,
          requestId,
          formData.domesticCategory,
          formData.certificationType,
          fetchedRenewalCompanyData,
        );
      } else if (isStandalone) {
        navigate("/registration", {
          state: {
            certificationMainType: formData.mainType,
            certificationType: actualCertificationType,
            selectedCertificationType: formData.certificationType,
            domesticCategory: formData.domesticCategory,
            requestType: formData.requestType,
            requestId,
            step: 2,
            renewalCompanyData: fetchedRenewalCompanyData,
          },
        });
      }
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "certificationType") {
        newData.domesticCategory = "";
      }

      if (field === "requestType" && value !== "RENEWAL") {
        newData.jawazNumber = "";
        setRenewalCompanyData(null);
      }

      return newData;
    });

    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const renderForm = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateRequest();
      }}
      className="space-y-6"
    >
      {selectedCertification && (
        <div className="rounded-2xl border border-blue-100  from-blue-50 to-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <selectedCertification.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {t("certification.page.certificationType.selectedType")}
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">
                  {selectedCertification.label}
                </h3>
                {/* <p className="mt-1 text-sm text-gray-600">
                  {selectedCertification.description}
                </p> */}
              </div>
            </div>
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      )}

      {formData.certificationType && (
        <div className="rounded-xl border border-gray-200  p-5 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {selectedCertification?.label}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCertification?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {requestTypeLabel} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.requestType}
                onChange={(e) =>
                  handleInputChange("requestType", e.target.value)
                }
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.requestType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">
                  {t("common.select")} {requestTypeLabel}
                </option>
                {requestTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.requestType && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.requestType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {certificationScopeLabel}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.mainType}
                onChange={(e) => handleInputChange("mainType", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.mainType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">
                  {t("common.select")} {certificationScopeLabel}
                </option>
                {mainTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.mainType && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.mainType}
                </p>
              )}
            </div>

            {formData.requestType === "RENEWAL" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("company.labels.jawazNumber")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.jawazNumber}
                  onChange={(e) =>
                    handleInputChange("jawazNumber", e.target.value)
                  }
                  placeholder={t("company.placeholder.jawazNumber")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.jawazNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.jawazNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.jawazNumber}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {formData.certificationType === "DOMESTIC_QUALITY_CERTIFICATION" && (
        <div className="rounded-xl border border-blue-100 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
           {t("certification.page.certificationType.selectCertificationType")}
            <span className="text-red-500">*</span>
          </label>
     
          <select
            value={formData.domesticCategory}
            onChange={(e) =>
              handleInputChange("domesticCategory", e.target.value)
            }
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.domesticCategory ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">
              {t("common.select")} {t("certification.page.certificationType.selectCertificationType")}
            </option>
            {domesticCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.domesticCategory && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.domesticCategory}
            </p>
          )}
        </div>
      )}


      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            {presetCertificationType
              ? t("common.previous")
              : t("common.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={
            isSubmitting ||
            isLookingUpCompany ||
            !formData.certificationType ||
            (formData.certificationType === "DOMESTIC_QUALITY_CERTIFICATION" &&
              !formData.domesticCategory) ||
            !formData.requestType ||
            (formData.requestType === "RENEWAL" &&
              !formData.jawazNumber.trim()) ||
            !formData.mainType
          }
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLookingUpCompany ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {isLookingUpCompany
                ? t("common.loading", "Loading")
                : t("common.saving")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t("common.saveAndContinue")}
            </span>
          )}
        </button>
      </div>
    </form>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-6">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {t("certification.page.title")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("certification.page.subtitle")}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-xl font-semibold text-white">
                {t("certification.page.cardTitle") || "Certification Details"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {t("certification.page.cardSubtitle") ||
                  "Please fill in the information below"}
              </p>
            </div>

            <div className="p-8">{renderForm()}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectionTitle}
            </h2>
            <p className="text-sm text-gray-500">{selectionSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-6">{renderForm()}</div>
    </div>
  );
};

export default CertificationTypeSelection;
