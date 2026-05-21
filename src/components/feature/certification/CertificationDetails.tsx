import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Award,
  Clock,
  TrendingUp,
  AlertCircle,
  File,
  Tag,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CreditCard,
} from "lucide-react";

import CertificationService from "../../../services/certification.service";
import { handleApi } from "../../../hooks/handleApi";

type Attachment = {
  id?: number;
  attachmentName?: string;
  name?: string;
  fileName?: string;
  filePath?: string;
  file?: string;
  fileSize?: number;
};

export const CertificationDetails: React.FC = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const toast = useRef<Toast>(null);

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "company" | "documents"
  >("details");
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    certificateInfo: true,
    companyInfo: true,
    requestInfo: true,
    contactPersonDetails: true,
    payments: true,
  });

  const numericRequestId = Number(requestId);

  const showError = (summary: string, detail?: string) => {
    toast.current?.show({ severity: "error", summary, detail });
  };

  const loadDetails = async () => {
    if (!numericRequestId) {
      showError(t("common.error"), "Invalid certification request id.");
      return;
    }

    setLoading(true);

    const response = await handleApi(
      () => CertificationService.getDetailsByRequestId(numericRequestId),
      () => {},
      showError,
      t,
    );

    if (response) {
      setDetails(response.data?.data || response.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, [numericRequestId]);

  const request = details?.certificationRequest || {};
  const company = details?.company || request.company || {};
  const contactPerson = request.contactPerson || {};
  const payments = request.payments || [];
  
  const requestAttachments: Attachment[] = request.attachments || [];
  const certificateAttachments: Attachment[] = [
    ...(details?.certificateAttachment ? [details.certificateAttachment] : []),
    ...(details?.attachments || []),
  ];

  const companyNameField = useMemo(() => {
    switch (i18n.language) {
      case "dr":
        return "companyNameDR";
      case "ps":
        return "companyNamePS";
      default:
        return "companyNameEN";
    }
  }, [i18n.language]);

  const aboutCompanyField = useMemo(() => {
    switch (i18n.language) {
      case "dr":
        return "aboutCompanyDr";
      case "ps":
        return "aboutCompanyPs";
      default:
        return "aboutCompanyEn";
    }
  }, [i18n.language]);

  const companyName =
    company?.[companyNameField] ||
    company?.companyNameEN ||
    company?.companyNameDR ||
    company?.companyNamePS ||
    "-";

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const labelize = (value?: string) =>
    value
      ? value
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "-";

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      sizes.length - 1,
    );
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${sizes[index]}`;
  };

  const assetUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:8080";
    return `${baseUrl}${path}`;
  };

  const getFileUrl = (attachment?: Attachment) =>
    assetUrl(attachment?.filePath || attachment?.file);
  const getFileName = (attachment?: Attachment) =>
    attachment?.attachmentName ||
    attachment?.fileName ||
    attachment?.name ||
    "Attachment";

  const getStatusConfig = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; bgColor: string; icon: React.ReactNode; label: string }
    > = {
      DRAFT: {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.DRAFT"),
      },
      SUBMITTED: {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: <Clock className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.SUBMITTED"),
      },
      UNDER_REVIEW: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.UNDER_REVIEW"),
      },
      APPROVED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.APPROVED"),
      },
      REJECTED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REJECTED"),
      },
      CERTIFICATE_ISSUED: {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        icon: <Award className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.CERTIFICATE_ISSUED"),
      },
      PAYMENT_PENDING: {
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.PAYMENT_PENDING"),
      },
      PAYMENT_COMPLETED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"),
      },
      INSPECTION_IN_PROGRESS: {
        color: "text-indigo-700",
        bgColor: "bg-indigo-100",
        icon: <Clock className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.INSPECTION_IN_PROGRESS"),
      },
      REPORTED_TO_COMMITTEE: {
        color: "text-pink-700",
        bgColor: "bg-pink-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REPORTED_TO_COMMITTEE"),
      },
      REPORT_APPROVED: {
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
      },
      UNDER_SUPERVISION: {
        color: "text-slate-700",
        bgColor: "bg-slate-100",
        icon: <ShieldCheck className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.UNDER_SUPERVISION"),
      },
      CANCELLED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.CANCELLED"),
      },
    };
    return (
      statusMap[status] || {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: status,
      }
    );
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const statusConfig = getStatusConfig(request.requestStatus);
  const hasAttachments =
    requestAttachments.length > 0 || certificateAttachments.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("certification.noDetailsFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("certification.checkRequestId")}
          </p>
          <button
            onClick={() => navigate("/certifications")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="min-h-screen bg-gray-50 pt-10 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("common.back")}
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {t("certification.certificateDetails")}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>
                        {t("certification.certificateId")}: {details?.id || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>
                        {t("certification.requestId")}:{" "}
                        {numericRequestId || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {t("common.createdDate")}:{" "}
                        {formatDate(details?.createdDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 md:gap-6">
              {[
                {
                  id: "details",
                  label: t("certification.certificateDetails"),
                  icon: <Award className="h-4 w-4" />,
                },
                {
                  id: "company",
                  label: t("company.labels.companyInfo"),
                  icon: <Building2 className="h-4 w-4" />,
                },
                {
                  id: "documents",
                  label: t("certification.documents"),
                  icon: <File className="h-4 w-4" />,
                  badge: hasAttachments
                    ? requestAttachments.length + certificateAttachments.length
                    : undefined,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === "details"
                      ? t("common.details")
                      : tab.id === "company"
                        ? t("common.company")
                        : t("common.documents")}
                  </span>
                  {tab.badge && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Timeline and Certificate Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Timeline Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleSection("timeline")}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        {t("common.timeline")}
                      </h3>
                      {expandedSections.timeline ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.timeline && (
                      <div className="px-6 pb-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {t("certification.certificateIssued")}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(details.issueDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {t("certification.requestSubmitted")}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(request.createdDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certificate Information Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleSection("certificateInfo")}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        {t("certification.certificateInformation")}
                      </h3>
                      {expandedSections.certificateInfo ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.certificateInfo && (
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Hash className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">
                                {t("certification.certificateNumber")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {details.certificateNumber || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Tag className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 ">
                                {t("certification.certificationType")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {labelize(details.certificationType)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <CalendarDays className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 ">
                                {t("certification.issueDate")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDate(details.issueDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <CalendarDays className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">
                                {t("certification.expiryDate")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDate(details.expiryDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Request Information Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleSection("requestInfo")}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {t("certification.requestDetails")}
                      </h3>
                      {expandedSections.requestInfo ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.requestInfo && (
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Hash className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 ">
                                {t("certification.serialNumber")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {request.serialNumber || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">
                                {t("certificationRequest.labels.trackingNumber")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {request.trackingNumber || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Tag className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 ">
                                {t("certificationRequest.labels.requestType")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {labelize(request.requestType)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">
                                {t("certificationRequest.labels.requestStatus")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {labelize(request.requestStatus)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Summary and Payments */}
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                    <Award className="h-12 w-12 mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">
                      {t("certification.certificateSummary")}
                    </h3>
                    <p className="text-blue-100 mb-4">
                      {t("certification.certificateIssuedTo")} {companyName}
                    </p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("common.completion")}</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate File Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <File className="h-5 w-5 text-blue-600" />
                        {t("certification.certificateFile")}
                      </h3>
                      {details.certificateUrl ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-blue-500" />
                            <span className="font-medium text-gray-900">
                              {t("certification.certificate")}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={assetUrl(details.certificateUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <a
                              href={assetUrl(details.certificateUrl)}
                              download
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.download")}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          {t("certification.noCertificateFile")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payments Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleSection("payments")}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        {t("certification.payments")}
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {payments.length}
                        </span>
                      </h3>
                      {expandedSections.payments ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.payments && (
                      <div className="px-6 pb-6">
                        {payments.length > 0 ? (
                          <div className="space-y-3">
                            {payments.map((payment: any, index: number) => (
                              <div
                                key={payment.id || index}
                                className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-semibold text-gray-900">
                                    {payment.transactionId ||
                                      `${t("certification.payment")} ${index + 1}`}
                                  </p>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                                    {payment.paymentAmount || "-"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {formatDate(payment.paymentDate)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">
                            {t("certification.noPayments")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === "company" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Profile - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Main Company Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header with Cover Style */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
                      <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                          {company.logoUrl ? (
                            <img
                              src={assetUrl(company.logoUrl)}
                              alt={companyName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-12 w-12 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="pt-16 px-6 pb-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {companyName}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {company.companyType && (
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                {labelize(company.companyType)}
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                company.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${company.active ? "bg-green-500" : "bg-gray-400"}`}
                              ></div>
                              {company.active
                                ? t("company.labels.active")
                                : t("company.labels.inactive")}
                            </span>
                          </div>
                        </div>
                        {company.websiteUrl && (
                          <a
                            href={company.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm"
                          >
                            <Globe className="h-4 w-4" />
                            {t("company.labels.visitWebsite")}
                          </a>
                        )}
                      </div>

                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                          <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("company.labels.email")}
                            </p>
                            <p className="font-medium text-gray-900 break-all">
                              {company.email || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                          <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("company.labels.phoneNumber")}
                            </p>
                            <p className="font-medium text-gray-900">
                              {company.phoneNumber || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl md:col-span-2">
                          <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("company.labels.address")}
                            </p>
                            <p className="font-medium text-gray-900">
                              {company.address || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Business Details */}
                      <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          {t("company.labels.businessInformation")}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                            <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                              {t("company.labels.jawazNumber")}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {company.jawazNumber || "-"}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                            <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">
                              {t("company.labels.jawazIssueDate")}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatShortDate(company.jawazIssueDate)}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                            <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">
                              {t("company.labels.jawazExpiryDate")}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatShortDate(company.jawazExpiryDate)}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                            <p className="text-xs text-green-600 uppercase tracking-wide mb-1">
                              {t("company.labels.establishYear")}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatShortDate(company.establishYear)}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-4">
                            <p className="text-xs text-cyan-600 uppercase tracking-wide mb-1">
                              {t("company.labels.activityPlace")}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {company.activityPlace || "-"}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
                            <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
                              {t("company.labels.ownerNameEn")}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {company.companyOwnerNameEn || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About Company Card */}
                  {company?.[aboutCompanyField] && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          {t("company.labels.aboutCompany")}
                        </h3>
                      </div>
                      <div className="px-6 py-4">
                        <p className="text-gray-700 leading-relaxed">
                          {company[aboutCompanyField]}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Categories Card */}
                  {company.categories?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Tag className="h-5 w-5 text-blue-600" />
                          {t("company.labels.categories")}
                        </h3>
                      </div>
                      <div className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {company.categories.map((category: any) => (
                            <span
                              key={category.id}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-sm"
                            >
                              {category.categoryName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Contact Person & Stats */}
                <div className="space-y-6">
                  {/* Contact Person Card */}
                  {contactPerson && contactPerson.id && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => toggleSection("contactPersonDetails")}
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <UserRound className="h-5 w-5 text-blue-600" />
                          {t("contactPerson.info")}
                        </h3>
                        {expandedSections.contactPersonDetails ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      {expandedSections.contactPersonDetails && (
                        <div className="px-6 pb-6">
                          <div className="grid grid-cols-1 gap-4 mb-6">
                            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                              <UserRound className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                  {t("contactPerson.fullName")}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {contactPerson.firstName}{" "}
                                  {contactPerson.lastName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                              <Briefcase className="h-5 w-5 text-purple-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                  {t("contactPerson.position")}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {contactPerson.position || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <button
                              onClick={() =>
                                (window.location.href = `mailto:${contactPerson.email}`)
                              }
                              className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                            >
                              <Mail className="h-5 w-5 text-green-600" />
                              <div className="flex-1 text-left">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">
                                  {t("contactPerson.email")}
                                </p>
                                <p className="font-medium text-gray-800">
                                  {contactPerson.email || "-"}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                              onClick={() =>
                                (window.location.href = `tel:${contactPerson.phoneNumber}`)
                              }
                              className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                            >
                              <Phone className="h-5 w-5 text-blue-600" />
                              <div className="flex-1 text-left">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">
                                  {t("contactPerson.phoneNumber")}
                                </p>
                                <p className="font-medium text-gray-800">
                                  {contactPerson.phoneNumber || "-"}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Company Stats Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        {t("company.labels.companyStats")}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">
                            {t("company.labels.companyType")}
                          </span>
                          <span className="font-semibold text-gray-900 px-2 py-1 bg-blue-50 rounded-lg text-sm">
                            {labelize(company.companyType)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">
                            {t("company.labels.categoriesCount")}
                          </span>
                          <span className="font-semibold text-gray-900 px-2 py-1 bg-purple-50 rounded-lg text-sm">
                            {company.categories?.length || 0}{" "}
                            {t("company.labels.categories")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">
                            {t("company.labels.status")}
                          </span>
                          <span
                            className={`font-semibold px-2 py-1 rounded-lg text-sm ${company.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}
                          >
                            {company.active
                              ? t("company.labels.active")
                              : t("company.labels.inactive")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Attachments */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t("certification.requestAttachments")} (
                    {requestAttachments.length})
                  </h3>
                  {requestAttachments.length > 0 ? (
                    <div className="space-y-3">
                      {requestAttachments.map((attachment, index) => (
                        <div
                          key={attachment.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <File className="h-5 w-5 text-blue-500 shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {getFileName(attachment)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.fileSize)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={getFileUrl(attachment)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <a
                              href={getFileUrl(attachment)}
                              download
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.download")}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {t("certification.noAttachments")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Certificate Attachments */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    {t("certification.certificateAttachments")} (
                    {certificateAttachments.length})
                  </h3>
                  {certificateAttachments.length > 0 ? (
                    <div className="space-y-3">
                      {certificateAttachments.map((attachment, index) => (
                        <div
                          key={attachment.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <File className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {getFileName(attachment)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.fileSize)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={getFileUrl(attachment)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <a
                              href={getFileUrl(attachment)}
                              download
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.download")}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {t("certification.noCertificateFile")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificationDetails;
