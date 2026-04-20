// components/feature/certification/CertificationTypeSelection.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Award,
  Shield,
  CheckCircle,
  Building2,
  ArrowRight,
  Star,
  Clock,
  Users,
  RefreshCw,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useAppToast } from "../../../../hooks/useToast";
import CertificationRequestService from "../../../../services/CertificationReques.service";

interface RequestType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  lightColor: string;
  textColor: string;
}

interface CertificationType {
  id: string;
  title: string;
  shortDescription: string;
  icon: React.ReactNode;
  popular: boolean;
  color: string;
  lightColor: string;
  textColor: string;
  keyBenefits: string[];
  requestTypes: string[]; // Which request types this certification supports
}

const CertificationTypeSelection = () => {
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(
    null,
  );
  const [selectedCertificationType, setSelectedCertificationType] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useAppToast();
  const { t } = useTranslation();

  // Request Types from your enum
  const requestTypes: RequestType[] = [
    {
      id: "NEW",
      title: t("certification.page.requestType.new.title"),
      description: t("certification.page.requestType.new.description"),
      icon: <FileText className="h-8 w-8" />,
      color: "from-emerald-600 to-emerald-700",
      lightColor: "from-emerald-50 to-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      id: "RENEWAL",
      title: t("certification.page.requestType.renewal.title"),
      description: t("certification.page.requestType.renewal.description"),
      icon: <RefreshCw className="h-8 w-8" />,
      color: "from-amber-600 to-amber-700",
      lightColor: "from-amber-50 to-amber-100",
      textColor: "text-amber-600",
    },
  ];

  const certificationTypes: CertificationType[] = [
    {
      id: "DOMESTIC_QUALITY_CERTIFICATION",
      title: t("certification.page.certificationType.domestic.title"),
      shortDescription: t(
        "certification.page.certificationType.domestic.description",
      ),
      icon: <Building2 className="h-8 w-8" />,
      popular: true,
      color: "from-blue-600 to-blue-700",
      lightColor: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      keyBenefits: [
        t("certification.page.certificationType.domestic.benefits.1"),
        t("certification.page.certificationType.domestic.benefits.2"),
        t("certification.page.certificationType.domestic.benefits.3"),
      ],
      requestTypes: ["NEW", "RENEWAL"],
    },
    {
      id: "INTERNATIONAL_QUALITY_CERTIFICATION",
      title: t("certification.page.certificationType.international.title"),
      shortDescription: t(
        "certification.page.certificationType.international.description",
      ),
      icon: <Globe className="h-8 w-8" />,
      popular: false,
      color: "from-indigo-600 to-indigo-700",
      lightColor: "from-indigo-50 to-indigo-100",
      textColor: "text-indigo-600",
      keyBenefits: [
        t("certification.page.certificationType.international.benefits.1"),
        t("certification.page.certificationType.international.benefits.2"),
        t("certification.page.certificationType.international.benefits.3"),
      ],
      requestTypes: ["NEW", "RENEWAL"],
    },
    {
      id: "STANDARD_MARK_CERTIFICATION",
      title: t("certification.page.certificationType.standard.title"),
      shortDescription: t(
        "certification.page.certificationType.standard.description",
      ),
      icon: <Award className="h-8 w-8" />,
      popular: false,
      color: "from-purple-600 to-purple-700",
      lightColor: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      keyBenefits: [
        t("certification.page.certificationType.standard.benefits.1"),
        t("certification.page.certificationType.standard.benefits.2"),
        t("certification.page.certificationType.standard.benefits.3"),
      ],
      requestTypes: ["NEW", "RENEWAL"],
    },
  ];

  // Filter certification types based on selected request type
  const filteredCertificationTypes = selectedRequestType
    ? certificationTypes.filter((type) =>
        type.requestTypes.includes(selectedRequestType),
      )
    : certificationTypes;

  const handleCreateRequest = async () => {
    if (!selectedRequestType) {
      showToast(
        "error",
        t("common.error"),
        t("certification.validation.requestTypeRequired"),
      );
      return;
    }

    if (!selectedCertificationType) {
      showToast(
        "error",
        t("common.error"),
        t("certification.validation.certificationTypeRequired"),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Create DRAFT certification request
      const requestData = {
        requestType: selectedRequestType,
        requestStatus: "DRAFT",
        certificationType: selectedCertificationType,
      };

      const response = await CertificationRequestService.create(requestData);

      if (response.data && response.data.data?.id) {
        const requestId = response.data.data.id;

        showToast(
          "success",
          t("common.success"),
          t("certification.messages.created"),
        );

        // Store in sessionStorage
        sessionStorage.setItem("certificationRequestId", requestId.toString());
        sessionStorage.setItem("certificationType", selectedCertificationType);
        sessionStorage.setItem("requestType", selectedRequestType);

        // Navigate to registration with state
        navigate("/registration", {
          state: {
            certificationType: selectedCertificationType,
            requestType: selectedRequestType,
            requestId: requestId,
            step: 1,
          },
        });
      }
    } catch (error: any) {
      console.error("Error creating certification request:", error);
      showToast(
        "error",
        t("common.error"),
        error.response?.data?.message ||
          t("certification.messages.createFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-26">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Process Overview */}
        <div className="lg:w-1/3 bg-linear-to-br from-blue-900 to-blue-900 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
          {/* Animated background */}
    

          <div className="relative z-10 text-white text-center">
            <Building2 className="w-24 h-24 mx-auto mb-8 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">
              {t("certification.page.leftSide.title")}
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              {t("certification.page.leftSide.subtitle")}
            </p>

            {/* Simple process steps */}
            <div className="space-y-4 text-left max-w-xs mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span>{t("certification.page.leftSide.steps.1")}</span>
              </div>
              <div className="flex items-center space-x-3 opacity-70">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span>{t("certification.page.leftSide.steps.2")}</span>
              </div>
              <div className="flex items-center space-x-3 opacity-70">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span>{t("certification.page.leftSide.steps.3")}</span>
              </div>
              <div className="flex items-center space-x-3 opacity-70">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <span>{t("certification.page.leftSide.steps.4")}</span>
              </div>
              <div className="flex items-center space-x-3 opacity-70">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </div>
                <span>{t("certification.page.leftSide.steps.5")}</span>
              </div>
            </div>

            {/* Simple progress */}
            <div className="mt-12">
              <div className="text-2xl font-bold text-blue-200">
                {t("certification.page.leftSide.progress")}
              </div>
              <div className="text-xs text-blue-200 mt-2">
                {t("certification.page.leftSide.progressLabel")}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Selection Area */}
        <div className="lg:w-2/3 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Request Type Selection */}
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("certification.page.requestType.title")}
                </h2>
                <p className="text-gray-600">
                  {t("certification.page.requestType.subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requestTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedRequestType(type.id)}
                    className={`
                group relative bg-white rounded-2xl transition-all duration-300 cursor-pointer
                ${
                  selectedRequestType === type.id
                    ? "ring-2 ring-blue-500 shadow-xl scale-[1.02]"
                    : "hover:shadow-lg hover:scale-[1.01] border border-gray-100"
                }
            `}
                  >
                    {/* Visual gradient background on selection - subtle */}
                    {selectedRequestType === type.id && (
                      <div className="absolute inset-0 bg-linear-to-br from-gray-50 to-blue-50 rounded-2xl opacity-40"></div>
                    )}

                    <div className="relative p-6 h-36 z-10">
                      {/* Icon and Title Row */}
                      <div
                        className={`
                    flex items-start gap-4 mb-4 
                `}
                      >
                        {/* Icon container - clean and simple */}
                        <div
                          className={`
                        p-3 rounded-xl transition-all duration-300
                        ${
                          selectedRequestType === type.id
                            ? "bg-blue-500 shadow-md"
                            : "bg-gray-50 group-hover:bg-gray-100"
                        }
                    `}
                        >
                          <div
                            className={`
                            transition-colors duration-300
                            ${
                              selectedRequestType === type.id
                                ? "text-white"
                                : "text-gray-500"
                            }
                        `}
                          >
                            {type.icon}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3
                            className={`
                            text-lg font-semibold mb-2 transition-colors duration-300
                            ${
                              selectedRequestType === type.id
                                ? "text-blue-600"
                                : "text-gray-800"
                            }
                        `}
                          >
                            {type.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      </div>

                      {/* Selection Indicator - Only one indicator visible at a time */}
                      <div
                        className={`
                    absolute 
                    ${document.dir === "rtl" ? "left-4" : "right-4"}
                `}
                      >
                        {selectedRequestType === type.id &&
                          /* Selected indicator */
                          <div className="relative transition-all duration-300 transform scale-100 opacity-100">
                            <div
                              className={`
                                    w-9 h-9 rounded-full flex items-center justify-center shadow-lg
                                    bg-linear-to-r ${type.color}
                                `}
                            >
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <div
                              className={`
                                    absolute inset-0 rounded-full animate-ping opacity-30
                                    bg-linear-to-r ${type.color}
                                `}
                            ></div>
                          </div>
                       }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Type Selection - Only show if request type is selected */}
            {selectedRequestType && (
              <div className="mb-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {t("certification.page.certificationType.title")}
                  </h2>
                  <p className="text-gray-500 text-lg">
                    {t("certification.page.certificationType.subtitle")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {filteredCertificationTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedCertificationType(type.id)}
                      className={`
                        group relative bg-white rounded-2xl h-89 transition-all duration-300 cursor-pointer overflow-hidden
                        ${
                          selectedCertificationType === type.id
                            ? "ring-2 ring-blue-500 shadow-xl scale-[1.02]"
                            : "hover:shadow-lg hover:scale-[1.01] border border-gray-100"
                        }
                        ${document.dir === "rtl" ? "text-right" : "text-left"}
                    `}
                    >
                      {/* Visual gradient background on selection */}
                      {selectedCertificationType === type.id && (
                        <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-60"></div>
                      )}

                      <div className="relative p-7 z-10">
                        {/* Icon with modern styling */}
                        <div
                          className={`
                                flex items-start gap-4 mb-5
                                ${document.dir === "rtl" ? "flex-row-reverse" : ""}
                            `}
                        >
                          <div
                            className={`
                                    p-3 rounded-xl transition-all duration-300
                                    ${
                                      selectedCertificationType === type.id
                                        ? "bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg"
                                        : "bg-linear-to-br from-gray-100 to-gray-50 group-hover:from-gray-100 group-hover:to-gray-200"
                                    }
                                `}
                          >
                            <div
                              className={`
                                        transition-colors duration-300
                                        ${
                                          selectedCertificationType === type.id
                                            ? "text-white"
                                            : "text-gray-600 group-hover:text-gray-700"
                                        }
                                    `}
                            >
                              {type.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`
                                        text-xl font-bold mb-2 transition-colors duration-300
                                        ${
                                          selectedCertificationType === type.id
                                            ? "text-blue-600"
                                            : "text-gray-800 group-hover:text-gray-900"
                                        }
                                    `}
                            >
                              {type.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {type.shortDescription}
                            </p>
                          </div>
                        </div>

                        {/* Key Benefits with modern icons */}
                        <div className="mb-6 space-y-3">
                          {type.keyBenefits.map((benefit, index) => (
                            <div
                              key={index}
                              className={`
                                        flex items-start text-sm
                                        ${document.dir === "rtl" ? "flex-row-reverse" : ""}
                                    `}
                            >
                              <div
                                className={`
                                            shrink-0 mt-0.5
                                            ${document.dir === "rtl" ? "ml-3" : "mr-3"}
                                        `}
                              >
                                <div
                                  className={`
                                                w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                                                ${
                                                  selectedCertificationType ===
                                                  type.id
                                                    ? "bg-blue-100"
                                                    : "bg-gray-100 group-hover:bg-gray-200"
                                                }
                                            `}
                                >
                                  <CheckCircle
                                    className={`
                                                    h-3 w-3
                                                    ${
                                                      selectedCertificationType ===
                                                      type.id
                                                        ? "text-blue-600"
                                                        : "text-gray-500"
                                                    }
                                                `}
                                  />
                                </div>
                              </div>
                              <span className="text-gray-700 flex-1">
                                {benefit}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Selection Indicator - Properly positioned */}
                        <div
                          className={`
                                absolute 
                                ${document.dir === "rtl" ? "left-4" : "right-4"}
                                z-20
                            `}
                        >
                          {/* Selected indicator */}
                          <div
                            className={`
                                    relative transition-all duration-300 transform
                                    ${
                                      selectedCertificationType === type.id
                                        ? "scale-100 opacity-100"
                                        : "scale-50 opacity-0 pointer-events-none absolute"
                                    }
                                `}
                          >
                            <div
                              className={`
                                        w-9 h-9 rounded-full flex items-center justify-center shadow-lg
                                        bg-linear-to-r ${type.color}
                                    `}
                            >
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <div
                              className={`
                                        absolute inset-0 rounded-full animate-ping opacity-30
                                        bg-linear-to-r ${type.color}
                                    `}
                            ></div>
                          </div>

                          {/* Unselected indicator */}
                          {/* <div
                                className={`
                                    transition-all duration-300
                                    ${
                                        selectedCertificationType === type.id
                                            ? "opacity-0 scale-0 pointer-events-none absolute"
                                            : "opacity-100 scale-100"
                                    }
                                `}
                            >
                                <div className="w-9 h-9 border-2 border-gray-300 rounded-full flex items-center justify-center group-hover:border-gray-400 transition-colors bg-white">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors"></div>
                                </div>
                            </div> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Action button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleCreateRequest}
                disabled={
                  !selectedRequestType ||
                  !selectedCertificationType ||
                  isSubmitting
                }
                className="group px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[250px] shadow-md hover:shadow-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className={document.dir === "rtl" ? "mr-3" : "ml-3"}>
                      {t("certification.page.button.creating")}
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span>{t("certification.page.button.continue")}</span>
                    <ArrowRight
                      className={`
                    h-4 w-4 transition-transform duration-300
                    ${
                      document.dir === "rtl"
                        ? "mr-2 rotate-180 group-hover:-translate-x-1"
                        : "ml-2 group-hover:translate-x-1"
                    }
                `}
                    />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationTypeSelection;
