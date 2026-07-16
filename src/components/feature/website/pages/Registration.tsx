// pages/Registration.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast } from "primereact/toast";
import {
  Building2,
  User,
  FileText,
  Check,
  Award,
  Globe,
  Shield,
  ChevronLeft,
  AlertTriangle,
  Send,
  Copy,
  Home,
  X,
  Download,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAppToast } from "../../../../hooks/useToast";
import ContactPersonForm from "./ContactPersonForm";
import AttachmentForm from "./AttachmentFormProps";
import CompanyForm from "./CompanyForm";
import CertificationRequestService from "../../../../services/CertificationReques.service";
import { useTranslation } from "react-i18next";
import CertificationTypeSelection from "./CertificationTypeSelection";
import CertificationEntrySelection from "./CertificationEntrySelection";

interface LocationState {
  certificationMainType?: string;
  certificationType?: string;
  selectedCertificationType?: string;
  domesticCategory?: string;
  requestType?: string;
  requestId?: number;
  step?: number;
  renewalCompanyData?: any;
}

const REGISTRATION_STORAGE_KEYS = [
  "certificationDraft",
  "certificationRequestId",
  "certificationType",
  "selectedCertificationType",
  "domesticCategory",
  "certificationMainType",
  "requestType",
  "renewalJawazNumber",
  "renewalCompanyData",
  "companyId",
  "contactPersonId",
  "attachmentId",
  "company_70_attachment_id",
];

const Registration = () => {
  const { t } = useTranslation();
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<number>(1);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedCertificationType, setSelectedCertificationType] =
    useState<string>("");

  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [submittedRequestData, setSubmittedRequestData] = useState<any>(null);
  const [certificationInfo, setCertificationInfo] = useState<{
    mainType: string;
    type: string;
    domesticCategory?: string;
    requestType: string;
    requestId: number;
  } | null>(null);
  const [renewalCompanyData, setRenewalCompanyData] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast } = useAppToast();

  const getSelectedCertificationStepTitle = () => {
    if (selectedCertificationType === "STANDARD_MARK_CERTIFICATION") {
      return t(
        "certification.page.certificationType.standard.requestTitle",
        "Standard Mark Request",
      );
    }

    if (selectedCertificationType === "DOMESTIC_QUALITY_CERTIFICATION") {
      return t(
        "certification.page.certificationType.domestic.requestTitle",
        "Quality Certification Request",
      );
    }

    return t("registration.steps.certificationrequest");
  };

  useEffect(() => {
    // Get certification info from location state or session storage
    const state = location.state as LocationState;
    const storedDraft = localStorage.getItem("certificationDraft");
    const storedSelectedCertificationType = localStorage.getItem("selectedCertificationType");
    const storedRequestId = sessionStorage.getItem("certificationRequestId");
    const storedCertificationType = sessionStorage.getItem("certificationType");
    const storedDomesticCategory = sessionStorage.getItem("domesticCategory");
    const storedMainType = sessionStorage.getItem("certificationMainType");
    const storedRequestType = sessionStorage.getItem("requestType");
    const storedRenewalCompanyData = sessionStorage.getItem("renewalCompanyData");
    const parsedRenewalCompanyData = storedRenewalCompanyData
      ? JSON.parse(storedRenewalCompanyData)
      : null;

    if (state?.requestId && state?.certificationType) {
      setSelectedCertificationType(
        state.selectedCertificationType || state.certificationType,
      );
      setCertificationInfo({
        mainType: state.certificationMainType || "",
        type: state.certificationType,
        domesticCategory: state.domesticCategory || "",
        requestType: state.requestType || "",
        requestId: state.requestId,
      });
      setRenewalCompanyData(state.renewalCompanyData || parsedRenewalCompanyData);
      if (state.step) setStep(state.step);
    } else if (storedRequestId && storedCertificationType) {
      setSelectedCertificationType(
        storedSelectedCertificationType || storedCertificationType,
      );
      setCertificationInfo({
        mainType: storedMainType || "",
        type: storedCertificationType,
        domesticCategory: storedDomesticCategory || "",
        requestType: storedRequestType || "",
        requestId: parseInt(storedRequestId),
      });
      setRenewalCompanyData(parsedRenewalCompanyData);
    } else if (storedDraft) {
      try {
        const draft = JSON.parse(storedDraft);
        const draftSelectedType =
          draft.selectedCertificationType || draft.certificationType || "";

        setSelectedCertificationType(
          storedSelectedCertificationType || draftSelectedType,
        );
        setCertificationInfo({
          mainType: draft.certificationMainType || "",
          type: draft.certificationType || "",
          domesticCategory: draft.domesticCategory || "",
          requestType: draft.requestType || "",
          requestId: draft.id || 0,
        });
        setRenewalCompanyData(parsedRenewalCompanyData);
      } catch (error) {
        console.error("Failed to parse saved certification draft:", error);
      }
    } else if (storedSelectedCertificationType) {
      setSelectedCertificationType(storedSelectedCertificationType);
    }

    // Also try to get companyId from session storage
    const storedCompanyId = sessionStorage.getItem("companyId");
    if (storedCompanyId) {
      setCompanyId(parseInt(storedCompanyId));
    }


  }, [location.state]);

  const steps = [
    {
      number: 1,
      title: getSelectedCertificationStepTitle(),
      icon: Check,
    },
    { number: 2, title: t("registration.steps.companyInfo"), icon: Building2 },
    { number: 3, title: t("registration.steps.contactPerson"), icon: User },
    { number: 4, title: t("registration.steps.documents"), icon: FileText },
    { number: 5, title: t("registration.steps.reviewSubmit"), icon: Check },
  ];

  const getCertificationIcon = (type: string) => {
    if (
      type?.includes("DOMESTIC") ||
      type === "MANAGEMENT_SYSTEM_QUALITY" ||
      type === "SERVICE_QUALITY" ||
      type === "PRODUCT_QUALITY"
    ) {
      return <Building2 className="h-5 w-5" />;
    }
    if (type?.includes("INTERNATIONAL")) return <Globe className="h-5 w-5" />;
    return <Award className="h-5 w-5" />;
  };

  const getCertificationColor = (type: string) => {
    if (
      type?.includes("DOMESTIC") ||
      type === "MANAGEMENT_SYSTEM_QUALITY" ||
      type === "SERVICE_QUALITY" ||
      type === "PRODUCT_QUALITY"
    ) {
      return "from-blue-600 to-blue-700";
    }
    if (type?.includes("INTERNATIONAL")) return "from-indigo-600 to-indigo-700";
    return "from-purple-600 to-purple-700";
  };

  const getDomesticCategoryLabel = (value: string) => {
    switch (value) {
      case "MANAGEMENT_SYSTEM_QUALITY":
        return t("certification.page.certificationType.domesticOptions.system");
      case "SERVICE_QUALITY":
        return t("certification.page.certificationType.domesticOptions.services");
      case "PRODUCT_QUALITY":
        return t("certification.page.certificationType.domesticOptions.product");
      default:
        return value;
    }
  };

  const handleCertificationSuccess = (
    requestType: string,
    mainType: string,
    certificationType: string,
    requestId: number,
    domesticCategory?: string,
    selectedType?: string,
    fetchedRenewalCompanyData?: any,
  ) => {
    if (selectedType) {
      setSelectedCertificationType(selectedType);
    }
    setCertificationInfo({
      mainType,
      type: certificationType,
      domesticCategory: domesticCategory || "",
      requestType,
      requestId,
    });
    setRenewalCompanyData(fetchedRenewalCompanyData || null);
    if (fetchedRenewalCompanyData?.id) {
      setCompanyId(fetchedRenewalCompanyData.id);
      sessionStorage.setItem("companyId", String(fetchedRenewalCompanyData.id));
      localStorage.setItem("companyId", String(fetchedRenewalCompanyData.id));
    }
    setStep(2);
    showToast(
      "success",
      t("common.success"),
      t("registration.toasts.certificationSuccess"),
    );
  };

  const handleCompanySuccess = (id: number) => {
    setCompanyId(id);
    sessionStorage.setItem("companyId", id.toString());
    setStep(3);
    showToast(
      "success",
      t("common.success"),
      t("registration.toasts.companySuccess"),
    );
  };

  const handleContactSuccess = () => {
    setStep(4);
    showToast(
      "success",
      t("common.success"),
      t("registration.toasts.contactSuccess"),
    );
  };

  const handleAttachmentSuccess = () => {
    setStep(5);
    showToast(
      "success",
      t("common.success"),
      t("registration.toasts.documentsSuccess"),
    );
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (!certificationInfo?.requestId) {
      showToast(
        "error",
        t("common.error"),
        t("registration.toasts.noRequestError"),
      );
      return;
    }

    setIsSubmitting(true);
    setShowConfirmationModal(false);

    try {
      const response = companyId
        ? await CertificationRequestService.submitAndReview(
            certificationInfo.requestId,
            "SUBMITTED",
            companyId,
          )
        : await CertificationRequestService.submitAndReview(
            certificationInfo.requestId,
            "SUBMITTED",
          );

      if (response.data?.success) {
        // Extract tracking number from response
        const trackingNum = response.data?.data?.trackingNumber;
        setTrackingNumber(trackingNum);
        setSubmittedRequestData(response.data?.data || null);
        setShowSuccessDialog(true); // Show success dialog instead of toast
        // Clear all persisted registration state after successful completion
        REGISTRATION_STORAGE_KEYS.forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      } else {
        const errorMessage =
          response.data?.errors?.[0] || t("registration.errors.submitFailed");
        showToast("error", t("common.error"), errorMessage);
      }
    } catch (error: any) {
      console.error("Failed to submit request:", error);
      showToast(
        "error",
        t("common.error"),
        t("registration.toasts.submitError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTrackingNumberFallback = (value: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    return copied;
  };

  const handleCopyTrackingNumber = async () => {
    if (!trackingNumber) {
      showToast(
        "warn",
        t("common.warning"),
        t("registration.toasts.noTrackingNumber"),
      );
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trackingNumber);
      } else if (!copyTrackingNumberFallback(trackingNumber)) {
        throw new Error("Clipboard fallback failed");
      }

      showToast(
        "success",
        t("common.success"),
        t("registration.toasts.trackingCopied"),
      );
    } catch (error) {
      console.error("Failed to copy tracking number:", error);

      if (copyTrackingNumberFallback(trackingNumber)) {
        showToast(
          "success",
          t("common.success"),
          t("registration.toasts.trackingCopied"),
        );
        return;
      }

      showToast(
        "error",
        t("common.error"),
        t("registration.toasts.trackingCopyFailed"),
      );
    }
  };

  const handleCancel = () => {
    REGISTRATION_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    navigate("/");
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const getAddressLine = (addresses?: any[]) => {
    const address = addresses?.[0];
    if (!address) return "-";

    return [
      address.district?.districtName,
      address.district?.province?.provinceName,
      address.district?.province?.country?.countryName,
    ]
      .filter(Boolean)
      .join(", ") || "-";
  };

  const resolveAssetUrl = (path?: string | null) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const assetBaseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:8080";
    return `${assetBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const handleDownloadSubmissionPdf = async () => {
    if (!submittedRequestData) {
      showToast("warn", t("common.warning"), t("registration.toasts.noRequestError"));
      return;
    }

    try {
      if (!pdfTemplateRef.current) {
        throw new Error("PDF template not ready");
      }

      const canvas = await html2canvas(pdfTemplateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      let remainingHeight = imgHeight - pageHeight;
      while (remainingHeight > 0) {
        position = remainingHeight - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(`certification-request-${submittedRequestData.trackingNumber || submittedRequestData.id || "summary"}.pdf`);
    } catch (error) {
      console.error("Error generating submission PDF:", error);
      showToast("error", t("common.error"), t("registration.errors.submitFailed"));
    }
  };

  const handleCertificationTypeSelect = (value: string) => {
    setSelectedCertificationType(value);
    setCertificationInfo(null);
    localStorage.setItem("certificationDraft", JSON.stringify({ selectedCertificationType: value }));
    localStorage.setItem("selectedCertificationType", value);
    sessionStorage.setItem("selectedCertificationType", value);
  };

  const handleBackToFirstSelection = () => {
    setStep(1);
    setSelectedCertificationType("");
    setCertificationInfo(null);
    localStorage.removeItem("selectedCertificationType");
    sessionStorage.removeItem("selectedCertificationType");
  };

  const handleStepNavigation = (targetStep: number) => {
    if (targetStep === 1) {
      handleBackToFirstSelection();
      return;
    }

    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          selectedCertificationType ? (
            <CertificationTypeSelection
              onSuccess={handleCertificationSuccess}
              onCancel={handleBackToFirstSelection}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              isStandalone={false}
              presetCertificationType={selectedCertificationType}
            />
          ) : (
            <CertificationEntrySelection
              embedded
              selectedValue={selectedCertificationType}
              onSelect={handleCertificationTypeSelect}
            />
          )
        );
      case 2:
        return (
          <CompanyForm
            onSuccess={handleCompanySuccess}
            onCancel={handlePreviousStep}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            prefillCompanyData={renewalCompanyData}
          />
        );

      case 3:
        if (!companyId) return null;
        return (
          <ContactPersonForm
            companyId={companyId}
            requestType={certificationInfo?.requestType}
            onSuccess={handleContactSuccess}
            onCancel={handlePreviousStep}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      case 4:
        if (!companyId) return null;
        return (
          <AttachmentForm
            companyId={companyId}
            onSuccess={handleAttachmentSuccess}
            onCancel={handlePreviousStep}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      case 5:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Check className="h-6 w-6 text-green-600 mr-2" />
              {t("registration.review.title")}
            </h2>

            <div className="space-y-6">
              {/* Certification Summary */}
              {certificationInfo && (
                <div
                  className={`p-6 bg-linear-to-r ${getCertificationColor(certificationInfo.type)} rounded-xl text-white`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      {getCertificationIcon(certificationInfo.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm opacity-90">
                        {t("registration.review.selectedCertification")}
                      </p>
                      <p className="text-xl font-semibold">
                        {t(
                          `certificationRequest.certificationTypeOptions.${certificationInfo.type}`,
                          certificationInfo.type.replace(/_/g, " "),
                        )}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {certificationInfo.domesticCategory && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded">
                            {getDomesticCategoryLabel(
                              certificationInfo.domesticCategory,
                            )}
                          </span>
                        )}
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          {t(
                            `certification.page.requestType.${certificationInfo.requestType?.toLowerCase()}.title`,
                          )}
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          {t(
                            `certification.page.mainType.${certificationInfo.mainType?.toLowerCase()}.title`,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pt-6 border-t">
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("common.previous")}
                </button>
                <button
                  onClick={() => setShowConfirmationModal(true)}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {t("common.submitting")}
                    </>
                  ) : (
                    <>
                      {t("registration.review.submitButton")}
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmationModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-center mb-2">
                    {t("registration.confirmation.title")}
                  </h3>

                  <p className="text-gray-600 text-center mb-6">
                    {t("registration.confirmation.message")}
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      {t("registration.confirmation.warning")}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmationModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t("common.submitting")}
                        </div>
                      ) : (
                        t("registration.confirmation.confirm")
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Beautiful Success Dialog with Flowers */}
            {showSuccessDialog && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4 success-overlay">
                <div className="relative max-w-md w-full">
                  {/* Flower Bouquet - Behind the dialog */}
              

                  {/* Main Dialog Card */}
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 success-dialog">
                    {/* Close button */}
                    <button
                      onClick={() => setShowSuccessDialog(false)}
                      className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>

                    <div className="p-8">
                      {/* Success Icon with Pulse Animation */}
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></div>
                          <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="h-12 w-12 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      </div>

                      {/* Congratulations Message */}
                      <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
                        {t("registration.successDialog.title")}
                      </h2>
                      
                      <p className="text-gray-600 text-center text-lg mb-2">
                        {t("registration.successDialog.message")}
                      </p>

                      {/* Divider with flowers */}
                      <div className="flex justify-center items-center gap-2 my-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-200"></div>
                        <span className="text-2xl">🌸</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-pink-200"></div>
                      </div>

                      {/* Thank You Message */}
                      <p className="text-gray-500 text-center mb-6 leading-relaxed">
                        {t("registration.successDialog.description")}
                      </p>

                      {/* Tracking Number Section (if available) */}
                      {trackingNumber && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                          <p className="text-xs text-blue-800 mb-2 text-center font-medium uppercase tracking-wide">
                            {t("registration.successDialog.referenceNumber")}
                          </p>
                          <div className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 border border-blue-200">
                            <code className="text-lg font-bold text-blue-900 font-mono tracking-wider">
                              {trackingNumber}
                            </code>
                            <button
                              onClick={handleCopyTrackingNumber}
                              className="p-1.5 hover:bg-blue-100 rounded-lg transition-all group"
                              title={t("registration.successDialog.copyTrackingNumber")}
                            >
                              <Copy className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleDownloadSubmissionPdf}
                          className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <Download className="h-5 w-5" />
                          {t("registration.downloadPdf")}
                        </button>

                        <button
                          onClick={() => {
                            setShowSuccessDialog(false);
                            if (trackingNumber) {
                              navigate(`/track-request?tracking=${trackingNumber}`);
                            } else {
                              navigate("/");
                            }
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <Shield className="h-5 w-5" />
                          {t("registration.successDialog.trackMyRequest")}
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowSuccessDialog(false);
                            navigate("/");
                          }}
                          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Home className="h-5 w-5" />
                          {t("common.close")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const shouldShowStepper = !(step === 1 && !selectedCertificationType);
  const request = submittedRequestData || {};
  const company = request.company || {};
  const contact = request.contactPerson || {};
  const companyCategories = Array.isArray(company.categories)
    ? company.categories.map((item: any) => item.categoryName).join(", ")
    : "-";
  const companyLogoUrl = resolveAssetUrl(
    company.logoUrl || company.bussinessLogoUrl,
  );
  const asqaLogoUrl = "/asqanew.png";
  const pdfText = {
    title: t("certificationRequest.pdf.title") || t("certificationRequest.requestDetails"),
    trackingNumber: t("certificationRequest.labels.trackingNumber"),
    serialNumber: t("certificationRequest.labels.serialNumber"),
    requestType: t("certificationRequest.labels.requestType"),
    createdDate: t("certificationRequest.labels.createdDate"),
    requestInfo: t("certificationRequest.pdf.requestInfo") || t("certificationRequest.requestInformation"),
    companyInfo: t("company.companyInfo") || t("company.labels.companyInfo"),
    contactInfo: t("contactPerson.info"),
    requestId: t("certificationRequest.labels.requestId") || "ID",
    requestStatus: t("certificationRequest.labels.requestStatus"),
    certificationType: t("certificationRequest.labels.certificationType"),
    companyNameEn: t("company.labels.companyNameEN"),
    companyNameDr: t("company.labels.companyNameDR"),
    companyNamePs: t("company.labels.companyNamePS"),
    email: t("company.labels.email"),
    phoneNumber: t("company.labels.phoneNumber"),
    address: t("company.labels.address"),
    mainBranchAddress: t("company.labels.mainBranchAddress"),
    activityPlace: t("company.labels.activityPlace"),
    jawazNumber: t("company.labels.jawazNumber"),
    tinNumber: t("company.labels.tinNumber"),
    website: t("company.labels.websiteUrl"),
    category: t("company.labels.categories") || t("company.labels.companyInfo"),
    firstName: t("contactPerson.firstName"),
    lastName: t("contactPerson.lastName"),
    position: t("contactPerson.position"),
    headerTitle: t("certificationRequest.pdf.headerTitle") || "Field",
    headerInfo: t("certificationRequest.pdf.headerInfo") || "Value",
    detailsTitle: t("certificationRequest.pdf.detailsTitle") || "Details",
    footer: t("certificationRequest.pdf.footer") || "This document was generated automatically by the ASQA request system.",
  };
  const translateRequestType = (value: string) =>
    value ? t(`certificationRequest.typeOptions.${value}`) || value : "-";
  const translateRequestStatus = (value: string) =>
    value ? t(`certificationRequest.statusOptions.${value}`) || value : "-";
  const translateCertificationType = (value: string) =>
    value ? t(`certificationRequest.certificationTypeOptions.${value}`) || value : "-";
  const requestRows = [
    [pdfText.requestId, String(request.id ?? "-")],
    [pdfText.serialNumber, request.serialNumber || "-"],
    [pdfText.trackingNumber, request.trackingNumber || "-"],
    [pdfText.requestType, translateRequestType(request.requestType || "")],
    [pdfText.requestStatus, translateRequestStatus(request.requestStatus || "")],
    [pdfText.certificationType, translateCertificationType(request.certificationType || "")],
    [pdfText.createdDate, formatDateTime(request.createdDate)],
  ];
  const companyRows = [
    [pdfText.companyNameEn, company.companyNameEN || "-"],
    [pdfText.companyNameDr, company.companyNameDR || "-"],
    [pdfText.companyNamePs, company.companyNamePS || "-"],
    [pdfText.phoneNumber, company.phoneNumber || "-"],
    [pdfText.email, company.email || "-"],
    [pdfText.address, company.address || "-"],
    [pdfText.mainBranchAddress, company.mainBranchAddress || "-"],
    [pdfText.activityPlace, company.activityPlace || "-"],
    [pdfText.jawazNumber, company.jawazNumber || "-"],
    [pdfText.tinNumber, company.tinNumber || "-"],
    [pdfText.website, company.websiteUrl || "-"],
    [pdfText.category, companyCategories || "-"],
  ];
  const contactRows = [
    [pdfText.firstName, contact.firstName || "-"],
    [pdfText.lastName, contact.lastName || "-"],
    [pdfText.position, contact.position || "-"],
    [pdfText.phoneNumber, contact.phoneNumber || "-"],
    [pdfText.email, contact.email || "-"],
    [pdfText.address, getAddressLine(contact.addresses)],
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Toast ref={toast} position="top-right" />
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t("registration.title")}
          </h1>
          <p className="text-gray-600">{t("registration.subtitle")}</p>
        </div>

        {/* Stepper */}
        {shouldShowStepper && (
          <div className="mb-10 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => (
                <div key={s.number} className="flex-1">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleStepNavigation(s.number)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        step >= s.number
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-600"
                      } ${step >= s.number || s.number === 1 ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {step > s.number ? <Check size={20} /> : s.number}
                    </button>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                          step > s.number ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStepNavigation(s.number)}
                    className={`mt-2 text-sm text-left hidden md:block ${
                      step >= s.number || s.number === 1
                        ? "text-gray-700 hover:text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {s.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Section */}
        {renderForm()}
      </div>

      <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">
        <div
          ref={pdfTemplateRef}
          dir="rtl"
          style={{
            width: "1020px",
            background: "#ffffff",
            color: "#111827",
            fontFamily: "Tahoma, Arial, sans-serif",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #cbd5e1",
              paddingBottom: "12px",
              marginBottom: "12px",
            }}
          >
            <div style={{ width: "92px", height: "92px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {companyLogoUrl ? <img src={companyLogoUrl} alt="Company" style={{ maxWidth: "84px", maxHeight: "84px", objectFit: "contain" }} /> : <div style={{ width: "84px", height: "84px", border: "1px solid #d1d5db" }} />}
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.3 }}>{pdfText.title}</div>
       
            </div>
            <div style={{ width: "92px", height: "92px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={asqaLogoUrl} alt="ASQA" style={{ maxWidth: "84px", maxHeight: "84px", objectFit: "contain" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px", fontSize: "11px" }}>
            {/* <div style={{ border: "1px solid #d1d5db", padding: "8px 10px", background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>{pdfText.requestType}</div>
              <div>{request.requestType || "-"}</div>
            </div>
            <div style={{ border: "1px solid #d1d5db", padding: "8px 10px", background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>{pdfText.certificationType}</div>
              <div>{request.certificationType || "-"}</div>
            </div> */}
            <div style={{ border: "1px solid #d1d5db", padding: "8px 10px", background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>{pdfText.createdDate}</div>
              <div>{formatDateTime(request.createdDate)}</div>
            </div>
          </div>

          {[
            { title: pdfText.requestInfo, rows: requestRows },
            { title: pdfText.companyInfo, rows: companyRows },
            { title: pdfText.contactInfo, rows: contactRows },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: "12px" }}>
              <div style={{ background: "#f3f4f6", border: "1px solid #d1d5db", borderBottom: "none", padding: "8px 10px", fontWeight: 700, fontSize: "13px" }}>
                {section.title}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", border: "1px solid #d1d5db", fontSize: "11px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "34%", background: "#f8fafc", borderBottom: "1px solid #d1d5db", padding: "7px 8px", textAlign: "right" }}>{pdfText.headerTitle}</th>
                    <th style={{ background: "#f8fafc", borderBottom: "1px solid #d1d5db", padding: "7px 8px", textAlign: "right" }}>{pdfText.detailsTitle}</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map(([label, value], index) => (
                    <tr key={`${section.title}-${index}`} style={{ background: index % 2 === 0 ? "#fcfcfc" : "#ffffff" }}>
                      <td style={{ borderBottom: "1px solid #e5e7eb", borderLeft: "1px solid #e5e7eb", padding: "7px 8px", fontWeight: 700 }}>{label}</td>
                      <td style={{ borderBottom: "1px solid #e5e7eb", padding: "7px 8px", wordBreak: "break-word" }}>{value || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #d1d5db", marginTop: "8px", paddingTop: "8px", fontSize: "10px", color: "#6b7280", textAlign: "right" }}>
            {pdfText.footer}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleUp {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleUp {
          animation: scaleUp 0.3s ease-out;
        }

        /* Success Dialog Styles */
        .success-overlay {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease-out;
        }

        .flower-bouquet {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 180px;
          pointer-events: none;
          z-index: 10;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.1));
          animation: float 3s ease-in-out infinite;
        }

        .success-dialog {
          animation: scaleUp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
        }

        .pdf-export-sheet * {
          box-sizing: border-box;
        }

        @media (max-width: 640px) {
          .flower-bouquet {
            width: 160px;
            height: 150px;
            top: -50px;
          }
        }
      `}</style>
    </div>
  );
};

export default Registration;

