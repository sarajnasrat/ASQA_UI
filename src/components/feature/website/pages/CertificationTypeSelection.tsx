import React, { useState, useEffect } from "react";
import { Building2, ArrowRight, AlertCircle } from "lucide-react";
import CertificationRequestService from "../../../../services/CertificationReques.service";
import { useNavigate } from "react-router-dom";
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
  ) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  setIsSubmitting?: (value: boolean) => void;
  isStandalone?: boolean;
}

const CertificationTypeSelection: React.FC<CertificationTypeSelectionProps> = ({
  onSuccess,
  onCancel,
  isSubmitting: externalIsSubmitting,
  setIsSubmitting: externalSetIsSubmitting,
  isStandalone = false,
}) => {
  const [formData, setFormData] = useState({
    requestType: "",
    mainType: "",
    certificationType: "",
  });

  const [errors, setErrors] = useState({
    requestType: "",
    mainType: "",
    certificationType: "",
  });

  const { showError, showSuccess } = useToast();
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const isSubmitting =
    externalIsSubmitting !== undefined
      ? externalIsSubmitting
      : internalIsSubmitting;

  const setIsSubmitting =
    externalSetIsSubmitting || setInternalIsSubmitting;

  /* =========================================================
     LOAD DRAFT FROM LOCAL STORAGE AND SESSION STORAGE
  ========================================================= */
  useEffect(() => {
    // Try to load from localStorage first
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    
    // Also try to get from sessionStorage (for navigation between steps)
    const sessionRequestId = sessionStorage.getItem("certificationRequestId");
    const sessionCertificationType = sessionStorage.getItem("certificationType");
    const sessionMainType = sessionStorage.getItem("certificationMainType");
    const sessionRequestType = sessionStorage.getItem("requestType");

    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      
      setFormData({
        requestType: draft.requestType || "",
        mainType: draft.certificationMainType || "",
        certificationType: draft.certificationType || "",
      });
      
    } 
    // If no localStorage but has sessionStorage (coming back from next steps)
    else if (sessionRequestId && sessionCertificationType) {
      setFormData({
        requestType: sessionRequestType || "",
        mainType: sessionMainType || "",
        certificationType: sessionCertificationType || "",
      });
      
      // Also save to localStorage for consistency
      const draftToSave = {
        id: parseInt(sessionRequestId),
        requestType: sessionRequestType || "",
        certificationMainType: sessionMainType || "",
        certificationType: sessionCertificationType || "",
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
    }
  }, []);

  /* =========================================================
     AUTO SAVE DRAFT WHEN USER CHANGES DATA
  ========================================================= */
  useEffect(() => {
    // Don't save empty form
    if (!formData.requestType && !formData.mainType && !formData.certificationType) {
      return;
    }

    const savedDraft = localStorage.getItem(STORAGE_KEY);
    const draft = savedDraft ? JSON.parse(savedDraft) : {};

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...draft,
        requestType: formData.requestType,
        certificationMainType: formData.mainType,
        certificationType: formData.certificationType,
      }),
    );
    
  }, [formData]);

  /* =========================================================
     OPTIONS
  ========================================================= */
  const requestTypeOptions = [
    { value: "NEW", label: t("certification.page.requestType.new.title") },
    { value: "RENEWAL", label: t("certification.page.requestType.renewal.title") },
  ];

  const mainTypeOptions = [
    { value: "INTERNAL", label: t("certification.page.certificationScope.internal.title") },
    { value: "EXTERNAL", label: t("certification.page.certificationScope.external.title") },
  ];

  const getCertificationOptions = () => {
    if (formData.mainType === "INTERNAL") {
      return [
        {
          value: "DOMESTIC_QUALITY_CERTIFICATION",
          label: t("certification.page.certificationType.domestic.title"),
        },
        {
          value: "STANDARD_MARK_CERTIFICATION",
          label: t("certification.page.certificationType.standard.title"),
        },
        
      ];
    }

    if (formData.mainType === "EXTERNAL") {
      return [
        {
          value: "DOMESTIC_QUALITY_CERTIFICATION",
          label: t("certification.page.certificationType.domestic.title"),
        },
        {
          value: "STANDARD_MARK_CERTIFICATION",
          label: t("certification.page.certificationType.standard.title"),
        },
      ];
    }

    return [];
  };

  /* =========================================================
     VALIDATION
  ========================================================= */
  const validateForm = () => {
    const newErrors = {
      requestType: "",
      mainType: "",
      certificationType: "",
    };

    let isValid = true;

    if (!formData.requestType) {
      newErrors.requestType = t("certification.validation.certificationScope");
      isValid = false;
    }

    if (!formData.mainType) {
      newErrors.mainType = t("certification.validation.certificationScope");
      isValid = false;
    }

    if (!formData.certificationType) {
      newErrors.certificationType = t(
        "certification.validation.certificationTypeRequired",
      );
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /* =========================================================
     CREATE OR UPDATE REQUEST
  ========================================================= */
  const handleCreateRequest = async () => {
    if (!validateForm()) {
      showError(t("common.validation.fillRequiredFields"));
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      requestType: formData.requestType,
      requestStatus: "DRAFT",
      certificationMainType: formData.mainType,
      certificationType: formData.certificationType,
    };

    const savedDraft = localStorage.getItem(STORAGE_KEY);
    const draft = savedDraft ? JSON.parse(savedDraft) : null;

    let response;
    let requestId;

    // ✅ UPDATE MODE - if we have an ID from draft
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
    }
    // ✅ CREATE MODE - no ID exists
    else {
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
        requestType: formData.requestType,
        certificationMainType: formData.mainType,
        certificationType: formData.certificationType,
      };

      // Save to both localStorage and sessionStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
      sessionStorage.setItem("certificationRequestId", String(requestId));
      sessionStorage.setItem("certificationType", formData.certificationType);
      sessionStorage.setItem("certificationScope", formData.mainType);
      sessionStorage.setItem("requestType", formData.requestType);


      if (onSuccess) {
        onSuccess(
          formData.requestType,
          formData.mainType,
          formData.certificationType,
          requestId,
        );
      } else if (isStandalone) {
        navigate("/registration", {
          state: {
            certificationMainType: formData.mainType,
            certificationType: formData.certificationType,
            requestType: formData.requestType,
            requestId,
            step: 1,
          },
        });
      }
    }

    setIsSubmitting(false);
  };

  /* =========================================================
     INPUT CHANGE
  ========================================================= */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "requestType") {
        newData.mainType = "";
        newData.certificationType = "";
      }

      if (field === "mainType") {
        newData.certificationType = "";
      }

      return newData;
    });

    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /* =========================================================
     CLEAR DRAFT (for debugging)
  ========================================================= */
  // const clearDraft = () => {
  //   localStorage.removeItem(STORAGE_KEY);
  //   setFormData({
  //     requestType: "",
  //     mainType: "",
  //     certificationType: "",
  //   });
  // };

  const renderForm = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateRequest();
      }}
      className="space-y-6"
    >
      {/* Hidden clear button for debugging - remove in production */}
      {/* {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={clearDraft}
          className="text-xs text-red-500 underline"
        >
          Clear Draft (Debug)
        </button>
      )} */}

      {/* Two Column Grid for dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("certification.page.requestType.title")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.requestType}
            onChange={(e) => handleInputChange("requestType", e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.requestType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">
              {t("common.select")} {t("certification.page.requestType.title")}
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

        {/* Main Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("certification.page.certificationScope.title")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.mainType}
            onChange={(e) => handleInputChange("mainType", e.target.value)}
            disabled={!formData.requestType}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              !formData.requestType
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : ""
            } ${errors.mainType ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">
              {!formData.requestType
                ? t("common.selectRequest")
                : t("common.select") +
                  " " +
                  t("certification.page.certificationScope.title")}
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
      </div>

      {/* Certification Type - Full width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("certification.page.certificationType.title")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.certificationType}
          onChange={(e) =>
            handleInputChange("certificationType", e.target.value)
          }
          disabled={!formData.mainType}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            !formData.mainType
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : ""
          } ${errors.certificationType ? "border-red-500" : "border-gray-300"}`}
        >
          <option value="">
            {!formData.mainType
              ? t("common.selectScope")
              : t("common.select") +
                " " +
                t("certification.page.certificationType.title")}
          </option>
          {getCertificationOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.certificationType && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.certificationType}
          </p>
        )}
      </div>

      {/* Buttons - Fixed width and properly spaced */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            {t("common.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.requestType ||
            !formData.mainType ||
            !formData.certificationType
          }
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t("common.saving")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t("common.saveAndContinue")}
              {/* <ArrowRight className="h-4 w-4" /> */}
            </span>
          )}
        </button>
      </div>
    </form>
  );

  // Standalone mode - Everything inside a beautiful card
  if (isStandalone) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header with Icon */}
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

          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-xl font-semibold text-white">
                {t("certification.page.cardTitle") || "Certification Details"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {t("certification.page.cardSubtitle") ||
                  "Please fill in the information below"}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-8">{renderForm()}</div>
          </div>
        </div>
      </div>
    );
  }

  // Integrated mode - Also in a card
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("certification.page.title")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("certification.page.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">{renderForm()}</div>
    </div>
  );
};

export default CertificationTypeSelection;