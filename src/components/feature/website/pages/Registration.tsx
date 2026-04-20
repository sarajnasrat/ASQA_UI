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
} from "lucide-react";
import { useAppToast } from "../../../../hooks/useToast";
import ContactPersonForm from "./ContactPersonForm";
import AttachmentForm from "./AttachmentFormProps";
import CompanyForm from "./CompanyForm";
import CertificationRequestService from "../../../../services/CertificationReques.service";
import { useTranslation } from "react-i18next";

interface LocationState {
  certificationType?: string;
  requestId?: number;
  step?: number;
}

const Registration = () => {
  const { t, i18n } = useTranslation();  
  const [step, setStep] = useState<number>(1);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [certificationInfo, setCertificationInfo] = useState<{
    type: string;
    requestId: number;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAppToast();

  useEffect(() => {
    // Get certification info from location state or session storage
    const state = location.state as LocationState;
    const storedRequestId = sessionStorage.getItem("certificationRequestId");
    const storedType = sessionStorage.getItem("certificationType");

    if (state?.requestId && state?.certificationType) {
      setCertificationInfo({
        type: state.certificationType,
        requestId: state.requestId,
      });
      if (state.step) setStep(state.step);
    } else if (storedRequestId && storedType) {
      setCertificationInfo({
        type: storedType,
        requestId: parseInt(storedRequestId),
      });
    }

    console.log("Registration loaded with:", {
      state,
      storedRequestId,
      storedType,
    });
  }, [location.state]);

  const steps = [
    { number: 1, title: t("registration.steps.companyInfo"), icon: Building2 },
    { number: 2, title: t("registration.steps.contactPerson"), icon: User },
    { number: 3, title: t("registration.steps.documents"), icon: FileText },
    { number: 4, title: t("registration.steps.review"), icon: Check },
  ];

  const getCertificationIcon = (type: string) => {
    if (type.includes("DOMESTIC")) return <Building2 className="h-5 w-5" />;
    if (type.includes("INTERNATIONAL")) return <Globe className="h-5 w-5" />;
    return <Award className="h-5 w-5" />;
  };

  const getCertificationColor = (type: string) => {
    if (type.includes("DOMESTIC")) return "from-blue-600 to-blue-700";
    if (type.includes("INTERNATIONAL")) return "from-indigo-600 to-indigo-700";
    return "from-purple-600 to-purple-700";
  };

  const getCertificationBadgeColor = (type: string) => {
    if (type.includes("DOMESTIC"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (type.includes("INTERNATIONAL"))
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    return "bg-purple-100 text-purple-700 border-purple-200";
  };

  const handleCompanySuccess = (id: number) => {
    setCompanyId(id);
    setStep(2);
    showToast("success", "Success", t("registration.toasts.companySuccess"));
  };

  const handleContactSuccess = () => {
    setStep(3);
    showToast("success", "Success", t("registration.toasts.contactSuccess"));
  };

  const handleAttachmentSuccess = () => {
    setStep(4);
    showToast("success", "Success", t("registration.toasts.documentsSuccess"));
  };

  const handleFinalSubmit = async () => {
    try {
      const requestId = sessionStorage.getItem("certificationRequestId");
      if (!requestId) {
        showToast("error", "Error", t("registration.toasts.noRequestError"));
        return;
      }

      // Call backend to update status to SUBMITTED
      const response = await CertificationRequestService.updateStatus(
        Number(requestId),

        "SUBMITTED",
        companyId!=null?companyId:0


      );

      // Check if backend returned success
      if (response.data?.success) {
        showToast("success", "Success", t("registration.toasts.submitSuccess"));

        // Clear session storage
        sessionStorage.removeItem("certificationRequestId");
        sessionStorage.removeItem("certificationType");

        // Navigate after short delay
        setTimeout(() => navigate("/companies"), 2000);
      } else {
        // Show backend error message
        const errorMessage =
          response.data?.errors?.[0] || t("registration.errors.submitFailed");
        showToast("error", "Error", errorMessage);
      }
    } catch (error: any) {
      console.error("Failed to submit request:", error);
      showToast("error", "Error", t("registration.toasts.submitError"));
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <CompanyForm
            onSuccess={handleCompanySuccess}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      case 2:
        if (!companyId) return null;
        return (
          <ContactPersonForm
            companyId={companyId}
            onSuccess={handleContactSuccess}
            onCancel={() => setStep(1)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      case 3:
        if (!companyId) return null;
        return (
          <AttachmentForm
            companyId={companyId}
            onSuccess={handleAttachmentSuccess}
            onCancel={() => setStep(2)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      case 4:
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
                    <div>
                      <p className="text-sm opacity-90">
                        {t("registration.review.selectedCertification")}
                      </p>
                      <p className="text-xl font-semibold">
              {t(`certificationRequest.certificationTypeOptions.${certificationInfo.type}`)}
                        {/* {certificationInfo.type.replace(/_/g, " ")} */}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {t("registration.steps.companyInfo")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("registration.review.stepCompleted")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex w-52">
                     <button
                onClick={handleFinalSubmit}
                className="w-full py-4 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {t("registration.review.submitButton")}
              </button>
              </div>

         
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 pt-26">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Enhanced with your original styling */}
 
        {/* Right Side - Form Section - Keeping your exact styles */}
        <div className="lg:w-2/2 p-8 lg:p-30 overflow-y-auto max-h-screen">
          <div className="">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t("registration.title")}
            </h1>
            <p className="text-gray-600 mb-8">{t("registration.subtitle")}</p>

            {/* Stepper - Keeping your exact styles */}
            <div className="mb-10">
              <div className="flex items-center justify-between pl-72">
                {steps.map((s, index) => (
                  <div key={s.number} className="flex-1">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-300 ${
                          step >= s.number
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step > s.number ? <Check size={20} /> : s.number}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 transition-colors duration-300 ${
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

            {/* Forms */}
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-gray-50 pt-26">
    //   <div className="flex flex-col lg:flex-row min-h-screen">
    //     {/* Left Side - Enhanced with your original styling */}
    //     <div className="lg:w-1/4 bg-linear-to-br from-blue-900 to-blue-900 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
    //       {/* Animated background elements */}

    //       <div className="relative z-10 text-white text-center w-full ">
    //         {/* Certification Badge - Only show if certification is selected */}
    //         {certificationInfo && (
    //           <div className="mb-8 inline-block">
    //             <div
    //               className={`px-4 py-2 ${getCertificationBadgeColor(certificationInfo.type)} rounded-full text-sm font-semibold inline-flex items-center ${i18n.dir() === "rtl" ? "space-x-reverse" : "space-x-2"}`}
    //             >
    //               {getCertificationIcon(certificationInfo.type)}
    //               <span>
    //                 {t("registration.leftPanel.selected")}:{" "}
    //                 {certificationInfo.type.replace(/_/g, " ")}
    //               </span>
    //             </div>
    //           </div>
    //         )}

    //         <Building2 className="w-24 h-24 mb-8 opacity-20 mx-auto" />
    //         <h2 className="text-2xl font-bold mb-4">
    //           {t("registration.leftPanel.title")}
    //         </h2>

    //         {/* Enhanced animated steps with RTL support */}
    //         <div
    //           className={`space-y-8  ${i18n.dir() === "rtl" ? "text-left" : "text-right"}`}
    //         >
    //           {steps.map((s) => (
    //             <div
    //               key={s.number}
    //               className={`flex items-center transition-all duration-300 `}
    //             >
    //               {/* Step Number/Icon - Will be on right for RTL, left for LTR */}
    //               <div
    //                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300`}>
                  
    //                 {step > s.number ? <Check className="w-5 h-5" /> : s.number}
    //               </div>

    //               {/* Step Description - Will be on left for RTL, right for LTR */}
    //               <div className="flex-1">
    //                 <span className="text-sm font-medium">{s.title}</span>
    //                 {step === s.number && (
    //                   <span
    //                     className={`text-xs text-blue-200 animate-pulse`}
    //                   >
    //                     ● {t("registration.leftPanel.inProgress")}
    //                   </span>
    //                 )}
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     </div>

    //     {/* Right Side - Form Section - Keeping your exact styles */}
    //     <div className="lg:w-2/2 p-8 lg:p-30 overflow-y-auto max-h-screen">
    //       <div className="">
    //         <h1 className="text-3xl font-bold text-gray-800 mb-2">
    //           {t("registration.title")}
    //         </h1>
    //         <p className="text-gray-600 mb-8">{t("registration.subtitle")}</p>

    //         {/* Stepper - Keeping your exact styles */}
    //         <div className="mb-10">
    //           <div className="flex items-center justify-between">
    //             {steps.map((s, index) => (
    //               <div key={s.number} className="flex-1">
    //                 <div className="flex items-center">
    //                   <div
    //                     className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-300 ${
    //                       step >= s.number
    //                         ? "bg-blue-600 text-white"
    //                         : "bg-gray-200 text-gray-600"
    //                     }`}
    //                   >
    //                     {step > s.number ? <Check size={20} /> : s.number}
    //                   </div>
    //                   {index < steps.length - 1 && (
    //                     <div
    //                       className={`flex-1 h-1 mx-2 transition-colors duration-300 ${
    //                         step > s.number ? "bg-blue-600" : "bg-gray-200"
    //                       }`}
    //                     ></div>
    //                   )}
    //                 </div>
    //                 <div className="mt-2 text-sm text-gray-600 hidden md:block">
    //                   {s.title}
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         </div>

    //         {/* Forms */}
    //         {renderForm()}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Registration;
