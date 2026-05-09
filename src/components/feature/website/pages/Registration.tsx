// pages/Registration.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  User,
  FileText,
  Check,
  Award,
  Globe,
  Shield,
  Clock,
  ArrowRight,
  ChevronLeft,
  AlertTriangle,
  ChevronRight,
  Send,
  Copy,
  Home,
} from "lucide-react";
import { useAppToast } from "../../../../hooks/useToast";
import ContactPersonForm from "./ContactPersonForm";
import AttachmentForm from "./AttachmentFormProps";
import CompanyForm from "./CompanyForm";
import CertificationRequestService from "../../../../services/CertificationReques.service";
import { useTranslation } from "react-i18next";
import CertificationTypeSelection from "./CertificationTypeSelection";

interface LocationState {
  certificationMainType?: string;
  certificationType?: string;
  requestType?: string;
  requestId?: number;
  step?: number;
}

const Registration = () => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<number>(1);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [certificationInfo, setCertificationInfo] = useState<{
    mainType: string;
    type: string;
    requestType: string;
    requestId: number;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAppToast();

  useEffect(() => {
    // Get certification info from location state or session storage
    const state = location.state as LocationState;
    const storedRequestId = sessionStorage.getItem("certificationRequestId");
    const storedCertificationType = sessionStorage.getItem("certificationType");
    const storedMainType = sessionStorage.getItem("certificationMainType");
    const storedRequestType = sessionStorage.getItem("requestType");

    if (state?.requestId && state?.certificationType) {
      setCertificationInfo({
        mainType: state.certificationMainType || "",
        type: state.certificationType,
        requestType: state.requestType || "",
        requestId: state.requestId,
      });
      if (state.step) setStep(state.step);
    } else if (storedRequestId && storedCertificationType) {
      setCertificationInfo({
        mainType: storedMainType || "",
        type: storedCertificationType,
        requestType: storedRequestType || "",
        requestId: parseInt(storedRequestId),
      });
    }

    // Also try to get companyId from session storage
    const storedCompanyId = sessionStorage.getItem("companyId");
    if (storedCompanyId) {
      setCompanyId(parseInt(storedCompanyId));
    }

    console.log("Registration loaded with:", {
      state,
      storedRequestId,
      storedCertificationType,
      storedMainType,
      storedRequestType,
    });
  }, [location.state]);

  const steps = [
    {
      number: 1,
      title: t("registration.steps.certificationrequest"),
      icon: Check,
    },
    { number: 2, title: t("registration.steps.companyInfo"), icon: Building2 },
    { number: 3, title: t("registration.steps.contactPerson"), icon: User },
    { number: 4, title: t("registration.steps.documents"), icon: FileText },
    { number: 5, title: t("registration.steps.reviewSubmit"), icon: Check },
  ];

  const getCertificationIcon = (type: string) => {
    if (type?.includes("DOMESTIC")) return <Building2 className="h-5 w-5" />;
    if (type?.includes("INTERNATIONAL")) return <Globe className="h-5 w-5" />;
    return <Award className="h-5 w-5" />;
  };

  const getCertificationColor = (type: string) => {
    if (type?.includes("DOMESTIC")) return "from-blue-600 to-blue-700";
    if (type?.includes("INTERNATIONAL")) return "from-indigo-600 to-indigo-700";
    return "from-purple-600 to-purple-700";
  };

  const getCertificationBadgeColor = (type: string) => {
    if (type?.includes("DOMESTIC"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (type?.includes("INTERNATIONAL"))
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    return "bg-purple-100 text-purple-700 border-purple-200";
  };

  const handleCertificationSuccess = (
    requestType: string,
    mainType: string,
    certificationType: string,
    requestId: number,
  ) => {
    setCertificationInfo({
      mainType,
      type: certificationType,
      requestType,
      requestId,
    });
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
        console.log("Tracking Number:", trackingNum);
        setTrackingNumber(trackingNum);
        setShowSuccessDialog(true); // Show success dialog instead of toast
        
        // Clear session storage
        sessionStorage.removeItem("certificationRequestId");
        sessionStorage.removeItem("certificationType");
        sessionStorage.removeItem("certificationMainType");
        sessionStorage.removeItem("requestType");
        sessionStorage.removeItem("companyId");
        sessionStorage.removeItem("contactPersonId");
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

  const handleCopyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber);
    showToast(
      "success",
      t("common.success"),
      t("registration.toasts.trackingCopied")
    );
  };

  const handleCancel = () => {
    // Clear session storage
    localStorage.removeItem("certificationRequestId");
    localStorage.removeItem("certificationType");
    localStorage.removeItem("certificationMainType");
    localStorage.removeItem("requestType");
    localStorage.removeItem("companyId");
    localStorage.removeItem("contactPersonId");
    localStorage.removeItem("attachmentId");
    localStorage.removeItem("certificationDraft");
    localStorage.removeItem("company_70_attachment_id");
    navigate("/");
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <CertificationTypeSelection
            onSuccess={handleCertificationSuccess}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            isStandalone={false}
          />
        );
      case 2:
        return (
          <CompanyForm
            onSuccess={handleCompanySuccess}
            onCancel={handlePreviousStep}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      case 3:
        if (!companyId) return null;
        return (
          <ContactPersonForm
            companyId={companyId}
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
              <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
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

            {/* Success Dialog */}
            {showSuccessDialog && (
              <div className="fixed inset-0  flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform animate-scaleUp">
                  {/* Success Animation */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    {t("registration.success.title", "✅ Request Submitted Successfully!")}
                  </h3>

                  <p className="text-gray-600 text-center mb-6">
                    {t("registration.success.message", "Your certification request has been submitted successfully.")}
                  </p>
                  
                  {/* Tracking Number Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5 mb-6">
                    <p className="text-sm text-blue-800 mb-2 text-center font-medium">
                      📋 {t("registration.success.trackingLabel", "Your Tracking Number")}
                    </p>
                    <div className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-xl font-bold text-blue-900 font-mono tracking-wider">
                        {trackingNumber}
                      </p>
                      <button
                        onClick={handleCopyTrackingNumber}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                        title={t("common.copy", "Copy")}
                      >
                        <Copy className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-3 text-center">
                      💡 {t("registration.success.trackingHint", "Save this number to track your request status")}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setShowSuccessDialog(false);
                        navigate(`/track-request?tracking=${trackingNumber}`);
                      }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                    >
                      <Shield className="h-5 w-5" />
                      {t("registration.success.trackRequest", "Track My Request")}
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowSuccessDialog(false);
                          navigate("/companies");
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Building2 className="h-4 w-4" />
                        {t("registration.success.viewCompanies", "View Companies")}
                      </button>
                      <button
                        onClick={() => {
                          setShowSuccessDialog(false);
                          navigate("/");
                        }}
                        className="flex-1 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        {t("registration.success.goHome", "Go Home")}
                      </button>
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t("registration.title")}
          </h1>
          <p className="text-gray-600">{t("registration.subtitle")}</p>
        </div>

        {/* Stepper */}
        <div className="mb-10 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step >= s.number
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > s.number ? <Check size={20} /> : s.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                        step > s.number ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600 hidden md:block">
                  {s.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Section */}
        {renderForm()}
      </div>

      {/* Add custom CSS animations */}
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleUp {
          animation: scaleUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Registration;