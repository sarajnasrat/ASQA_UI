import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Banknote,
  Briefcase,
  Building,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  Download,
  Eye,
  File,
  FileText,
  Globe,
  Hash,
  Home,
  Image,
  Mail,
  Map,
  MapPin,
  Paperclip,
  Phone,
  Receipt,
  Shield,
  ShieldCheck,
  Tag,
  TrendingUp,
  UserRound,
} from "lucide-react";

import CertificationService from "../../../services/certification.service";
import { handleApi } from "../../../hooks/handleApi";
import { CertificationUpdate } from "./CertificationUpdate";
import { useAppToast } from "../../../hooks/useToast";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import type { TFunction } from "i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import CompanyPdfExport, { type CompanyPdfExportHandle } from "../../common/pdf/CompanyPdfExport";

// Type Definitions
type Attachment = {
  id?: number;
  attachmentName?: string;
  name?: string;
  fileName?: string;
  filePath?: string;
  file?: string;
  fileType?: string;
  fileSize?: number;
  attachmentReferenceType?: string;
  paymentId?: number | null;
};

type Payment = {
  id: number;
  transactionId: string;
  paymentDate: string;
  paymentAmount: number;
  createdDate: string;
  certificationRequestId: number;
  requestTrackingNumber: string;
  requestStatus: string;
  attachments: Attachment[];
};

type Address = {
  id: number;
  details: string;
  addressType: string;
  district: {
    id: number;
    districtName?: string;
    province: {
      id: number;
      provinceName?: string;
      country: {
        id: number;
        countryName: string;
        countryCode: string;
      };
    };
  };
};

type ContactPerson = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  companyId: number | null;
  companyName: string | null;
  addresses: Address[];
};

type Category = {
  id: number;
  categoryName: string;
  categoryType: string | null;
  jobCount: string | null;
};

type SocialLink = {
  id?: number;
  platform?: string;
  url?: string;
};

type Company = {
  id: number;
  companyNameEN: string;
  companyNameDR: string;
  companyNamePS: string;
  email: string;
  phoneNumber: string;
  address: string;
  logoUrl: string;
  mainBranchAddress: string;
  activityPlace: string;
  activityType: string;
  jawazNumber: string;
  jawazExpiryDate: string;
  jawazIssueDate: string;
  tinNumber: string;
  bussinessLogoUrl: string;
  aboutCompanyEn: string;
  aboutCompanyDr: string;
  aboutCompanyPs: string;
  websiteUrl: string;
  establishYear: string;
  companyOwnerNameEn: string;
  companyOwnerNameDr: string;
  companyOwnerNamePs: string;
  attachments: Attachment[];
  categories: Category[];
  socialLinks: SocialLink[];
  active: boolean;
  companyType: string;
};

type CertificationRequest = {
  id: number;
  requestType: string;
  requestStatus: string;
  certificationType: string;
  serialNumber: string;
  trackingNumber: string;
  createdDate: string;
  attachments: Attachment[];
  payments: Payment[];
  trackers: any | null;
  startDate: string;
  endDate: string;
  company: Company;
  contactPerson: ContactPerson;
  isPrint: boolean | null;
  isScanned: boolean | null;
  certificationScope: string | null;
};

type CertificationDetails = {
  id: number;
  certificateNumber: string;
  certificationType: string;
  issueDate: string;
  expiryDate: string;
  certificateUrl: string | null;
  createdDate: string;
  updatedDate: string;
  certificationRequestId: number;
  certificationRequest: CertificationRequest;
  attachments?: Attachment[];
  certificateAttachment: Attachment | null;
  certificationStatus: string;
};

const statusTransitions: Record<string, string[]> = {
  DRAFT: ["PRINTED"],
  PRINTED: ["SCANNED"],
  CERTIFICATION_ISSUED: ["UNDER_SUPERVISION"],
  SCANNED: ["CERTIFICATION_ISSUED"],
  UNDER_SUPERVISION: [],
};

const finalStates = ["UNDER_SUPERVISION"];

export const CertificationDetails: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const pdfExportRef = React.useRef<CompanyPdfExportHandle>(null);

  const [details, setDetails] = useState<CertificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "company" | "documents" | "payments"
  >("details");
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    certificateInfo: true,
    requestInfo: true,
    contactPersonDetails: false,
    payments: true,
    companyAttachments: true,
    companyAbout: false,
    companyJawaz: true,
    companyOwner: false,
    companyCategories: true,
    companySocialLinks: false,
    contactAddresses: false,
  });

  const numericRequestId = Number(requestId);

  const request = details?.certificationRequest || ({} as CertificationRequest);
  const company = request?.company || ({} as Company);
  const contactPerson = request?.contactPerson || ({} as ContactPerson);
  const payments = request?.payments || [];
  const currentStatus = details?.certificationStatus || "DRAFT";

  const requestAttachments: Attachment[] = request?.attachments || [];
  const certificateAttachments: Attachment[] = [
    ...(details?.certificateAttachment ? [details.certificateAttachment] : []),
    ...(details?.attachments || []),
  ];
  const companyAttachments: Attachment[] = [
    ...(company?.attachments || []),
  ].reverse();

  // Get all payment attachments
  const paymentAttachments: Attachment[] = payments.flatMap(
    (payment) => payment.attachments || [],
  );

  const companyNameField = useMemo(() => {
    if (i18n.language === "dr") return "companyNameDR";
    if (i18n.language === "ps") return "companyNamePS";
    return "companyNameEN";
  }, [i18n.language]);

  const aboutCompanyField = useMemo(() => {
    if (i18n.language === "dr") return "aboutCompanyDr";
    if (i18n.language === "ps") return "aboutCompanyPs";
    return "aboutCompanyEn";
  }, [i18n.language]);

  const companyOwnerField = useMemo(() => {
    if (i18n.language === "dr") return "companyOwnerNameDr";
    if (i18n.language === "ps") return "companyOwnerNamePs";
    return "companyOwnerNameEn";
  }, [i18n.language]);

  const companyName =
    company?.[companyNameField] ||
    company?.companyNameEN ||
    company?.companyNameDR ||
    company?.companyNamePS ||
    "-";
  const phoneDisplayClass =
    "inline-block text-left [direction:ltr] [unicode-bidi:isolate]";

  const { toast, showToast } = useAppToast();

  const loadDetails = async () => {
    if (!numericRequestId) {
      showToast(
        "error",
        t("common.error"),
        t("certification.messages.invalidRequestId"),
      );
      setLoading(false);
      return;
    }

    setLoading(true);

    const response = await handleApi(
      () => CertificationService.getDetailsByRequestId(numericRequestId),
      () => {},
      (message: string) => showToast("error", t("common.error"), message),
      t,
    );

    if (response) {
      setDetails(response.data?.data || response.data);
    }

    setLoading(false);
  };

  const handleDownloadPdf = async () => {
    try {
      await pdfExportRef.current?.downloadPdf();
      showToast("success", t("common.success"), t("common.download"));
    } catch (error) {
      console.error("Error generating certification PDF:", error);
      showToast(
        "error",
        t("common.error"),
        t("registration.errors.submitFailed"),
      );
    }
  };

  useEffect(() => {
    loadDetails();
  }, [numericRequestId]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return IslamicDateFormatter.formatQamari(value, true);
  };

  const formatShortDate = (value?: string) => {
    if (!value) return "-";
    return IslamicDateFormatter.formatQamari(value);
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AFN",
    }).format(value);
  };

  const labelize = (value?: string) =>
    value
      ? value
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "-";

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return t("certification.messages.unknownSize");
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      sizes.length - 1,
    );
    return `${(bytes / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 1,
    )} ${sizes[index]}`;
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
    t("certification.attachment");

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, any> = {
      DRAFT: {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certification.statusOptions.DRAFT"),
      },
      PRINTED: {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certification.statusOptions.PRINTED"),
      },
      SCANNED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: t("certification.statusOptions.SCANNED"),
      },
      CERTIFICATION_ISSUED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: t("certification.statusOptions.CERTIFICATION_ISSUED"),
      },
      UNDER_SUPERVISION: {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        icon: <ShieldCheck className="h-4 w-4" />,
        label: t("certification.statusOptions.UNDER_SUPERVISION"),
      },
    };
    return (
      statusMap[status] || {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: labelize(t(`certification.statusOptions.${status}`) || status),
      }
    );
  };

  const getNextStatuses = () => statusTransitions[currentStatus] || [];

  const updateStatus = async (nextStatus: string) => {
    if (!details?.id) return;
    const response = await handleApi(
      () =>
        CertificationService.updateCertificationStatus(details.id, nextStatus),
      () => showToast("success", t("common.success"), labelize(nextStatus)),
      (message: string) => showToast("error", t("common.error"), message),
      t,
    );
    if (response) {
      navigate("/certifications");
    }
  };

  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);

  const confirmStatusUpdate = (nextStatus: string) => {
    const normalizedStatus = nextStatus?.trim().toUpperCase();
    if (normalizedStatus === "SCANNED") {
      setSelectedCertification(details);
      setUpdateDialogVisible(true);
      return;
    }
    if (normalizedStatus === "PRINTED") {
      navigate(`/certifications/print/${details?.id}`);
      return;
    }

    confirmDialog({
      header: t(
        `certification.statusOptions.${normalizedStatus}` || normalizedStatus,
      ),
      message: (
        <div className="space-y-4">
          <p className="text-gray-700">
            {t(
              normalizedStatus === "CERTIFICATION_ISSUED"
                ? "certification.confirmCertificationIssued"
                : "certification.confirmStatusUpdate",
            )}{" "}
            {/* <b>{t(`certification.statusOptions.${normalizedStatus}` || normalizedStatus)}</b>? */}
          </p>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                {t("certification.certificateNumber")}
              </span>
              <b>{details?.certificateNumber || "-"}</b>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                {t("company.labels.companyName")}
              </span>
              <b>{companyName}</b>
            </div>
          </div>
        </div>
      ),
      acceptLabel: t(
        `certification.statusOptions.${normalizedStatus}` || normalizedStatus,
      ),
      rejectLabel: t("common.cancel"),
      acceptClassName: "bg-green-600 border-green-600 text-white",
      accept: () => updateStatus(normalizedStatus),
      style: { width: "520px", maxWidth: "95vw" },
      breakpoints: { "640px": "95vw" },
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getAddressIcon = (addressType?: string) => {
    if (addressType === "HOME") return <Home className="h-3 w-3" />;
    if (addressType === "HEAD_OFFICE") return <Building className="h-3 w-3" />;
    if (addressType === "BRANCH_OFFICE")
      return <Building2 className="h-3 w-3" />;
    return <Map className="h-3 w-3" />;
  };

  const getFileTypeIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-5 w-5 text-blue-500" />;
    if (fileType.includes("pdf"))
      return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes("image"))
      return <Image className="h-5 w-5 text-green-500" />;
    return <File className="h-5 w-5 text-blue-500" />;
  };

  const statusConfig = getStatusConfig(currentStatus);
  const totalPaymentAmount = payments.reduce(
    (sum: number, p: Payment) => sum + (p.paymentAmount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20 px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("certification.noDetailsFound")}
          </h2>
          <button
            onClick={() => navigate("/certifications")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("common.back")}
          </button>
          
        </div>
      </div>
    );
  }
  const breadcrumbItems = [
    {
      label: t("certification.all"),
      url: "/certifications",
    },
    {
      label: details.certificateNumber,
      url:
        details.id != null
          ? `/certifications/${details.id}`
          : t("certification.certificateDetails"),
    },
  ];
  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="min-h-screen bg-gray-50 pt-6 pb-20">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <DynamicBreadcrumb
              items={breadcrumbItems}
              size="max-w-8xl"
              radius="rounded"
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
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
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-500">
                    <div>
                      {t("certification.certificateId")}: {details?.id || "-"}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {t("certification.requestId")}:{" "}
                      {details?.certificationRequestId || request?.id || "-"}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {t("common.createdDate")}:{" "}
                      {formatDate(details?.createdDate)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      {t("common.download")}
                    </span>
                  </button>
                  {!finalStates.includes(currentStatus) &&
                    getNextStatuses().map((status) => (
                      <button
                        key={status}
                        onClick={() => confirmStatusUpdate(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                          status === "REJECTED"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {t(`certification.steps.${status}`)}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-6 min-w-max">
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
                  badge:
                    requestAttachments.length +
                    certificateAttachments.length +
                    companyAttachments.length +
                    paymentAttachments.length,
                },
                {
                  id: "payments",
                  label: t("certification.payments"),
                  icon: <CreditCard className="h-4 w-4" />,
                  badge: payments.length,
                },
              ].map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-1 border-b-2 text-sm sm:text-base transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full font-medium">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SectionCard
                  title={t("common.timeline")}
                  icon={<Clock />}
                  expanded={expandedSections.timeline}
                  onToggle={() => toggleSection("timeline")}
                >
                  <div className="space-y-4">
                    <TimelineItem
                      icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                      bg="bg-green-100"
                      title={t("certification.certificateIssued")}
                      date={formatDate(details.issueDate)}
                    />
                    <TimelineItem
                      icon={<FileText className="h-4 w-4 text-blue-600" />}
                      bg="bg-blue-100"
                      title={t("certification.requestSubmitted")}
                      date={formatDate(request.createdDate)}
                    />
                    {payments.length > 0 && (
                      <TimelineItem
                        icon={
                          <CreditCard className="h-4 w-4 text-purple-600" />
                        }
                        bg="bg-purple-100"
                        title={t("certificationRequest.paymentCompleted")}
                        date={formatDate(payments[0]?.paymentDate)}
                      />
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  title={t("certification.certificateInformation")}
                  icon={<Award />}
                  expanded={expandedSections.certificateInfo}
                  onToggle={() => toggleSection("certificateInfo")}
                >
                  <InfoGrid
                    items={[
                      {
                        icon: <Hash />,
                        label: t("certification.certificateNumber"),
                        value: details.certificateNumber,
                      },
                      {
                        icon: <Tag />,
                        label: t("certificationRequest.certificationScope"),
                        value: t(
                          `certificationRequest.scopeOptions.${details.certificationRequest.certificationScope}`,
                        ), // TODO: use labelize(  details.certificationType),
                      },
                      {
                        icon: <Tag />,
                        label: t("certification.certificationType"),
                        value: t(
                          `certificationRequest.certificationTypeOptions.${details.certificationType}`,
                        ), // TODO: use labelize(  details.certificationType),
                      },
                      {
                        icon: <ShieldCheck />,
                        label: t("certification.status"),
                        value: t(
                          `certification.statusOptions.${currentStatus}`,
                        ), // TODO: use labelize(currentStatus),
                      },
                      {
                        icon: <CalendarDays />,
                        label: t("certification.issueDate"),
                        value: formatDate(details.issueDate),
                      },
                      {
                        icon: <CalendarDays />,
                        label: t("certification.expiryDate"),
                        value: formatDate(details.expiryDate),
                      },
                    ]}
                  />
                </SectionCard>

                <SectionCard
                  title={t("certificationRequest.requestDetails")}
                  icon={<FileText />}
                  expanded={expandedSections.requestInfo}
                  onToggle={() => toggleSection("requestInfo")}
                >
                  <InfoGrid
                    items={[
                      {
                        icon: <FileText />,
                        label: t("certification.serialNumber"),
                        value: request.serialNumber,
                      },
                      {
                        icon: <FileText />,
                        label: t("certificationRequest.labels.trackingNumber"),
                        value: request.trackingNumber,
                      },
                      {
                        icon: <Tag />,
                        label: t("certificationRequest.labels.requestType"),
                        value: t(
                          `certificationRequest.typeOptions.${request.requestType}`,
                        ), // TODO: use labelize(request.requestType),
                      },
                      {
                        icon: <Clock />,
                        label: t("certificationRequest.labels.requestStatus"),
                        value: t(
                          `certificationRequest.statusOptions.${request.requestStatus}`,
                        ), // TODO: use labelize(request.requestStatus`),
                      },
                      {
                        icon: <CalendarDays />,
                        label: t("certificationRequest.labels.startDate"),
                        value: formatShortDate(request.startDate),
                      },
                      {
                        icon: <CalendarDays />,
                        label: t("certificationRequest.labels.endDate"),
                        value: formatShortDate(request.endDate),
                      },
                    ]}
                  />
                </SectionCard>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                  <Award className="h-12 w-12 mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-2">
                    {t("certification.certificateSummary")}
                  </h3>
                  <p className="text-blue-100 mb-4">
                    {t("certification.certificateIssuedTo")} {companyName}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 opacity-70" />
                      <span>
                        {t("certificationRequest.labels.trackingNumber")}:{" "}
                        {request.trackingNumber || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 opacity-70" />
                      <span>
                        {t("certification.payments")}: {payments.length}
                      </span>
                    </div>
                  </div>
                </div>

                <PlainCard
                  title={t("certification.certificateFile")}
                  icon={<File />}
                >
                  {details.certificateAttachment ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileTypeIcon(
                          details.certificateAttachment.fileType,
                        )}
                        <span className="font-medium text-gray-900 truncate">
                          {t("certification.certificate")}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a
                          href={assetUrl(details?.certificateAttachment?.file)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={assetUrl(details.certificateUrl ?? undefined)}
                          download
                          className="p-1.5 text-gray-500 hover:text-blue-600"
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
                </PlainCard>

                {/* Payments Summary Card */}
                <SectionCard
                  title={`${t("certification.payments")} (${payments.length})`}
                  icon={<CreditCard />}
                  expanded={expandedSections.payments}
                  onToggle={() => toggleSection("payments")}
                >
                  {payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.map((payment: Payment, index: number) => (
                        <div
                          key={payment.id || index}
                          className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 break-all">
                                {payment.transactionId ||
                                  `${t("certification.payment")} ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(payment.paymentDate)}
                              </p>
                            </div>
                            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold whitespace-nowrap">
                              {formatCurrency(payment.paymentAmount)}
                            </span>
                          </div>
                          {payment.attachments?.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <Paperclip className="h-3 w-3" />
                                {payment.attachments.length}{" "}
                                {t("certification.attachment")}
                              </div>
                              {payment.attachments.map(
                                (att: Attachment, idx: number) => (
                                  <div
                                    key={att.id || idx}
                                    className="flex items-center justify-between p-2 bg-white rounded-lg mt-1"
                                  >
                                    <span className="text-xs text-gray-700 truncate">
                                      {getFileName(att)}
                                    </span>
                                    <div className="flex gap-1 shrink-0">
                                      <a
                                        href={getFileUrl(att)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 text-blue-500 hover:text-blue-700"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </a>
                                      <a
                                        href={getFileUrl(att)}
                                        download
                                        className="p-1 text-blue-500 hover:text-blue-700"
                                      >
                                        <Download className="h-3 w-3" />
                                      </a>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {payments.length > 1 && (
                        <div className="p-3 bg-blue-50 rounded-xl flex justify-between items-center">
                          <span className="font-semibold text-blue-900">
                            {t("certificationRequest.payment.totalAmountDue")}
                          </span>
                          <span className="font-bold text-blue-900">
                            {formatCurrency(totalPaymentAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      {t("certification.noPayments")}
                    </p>
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              {/* Payments Summary Banner */}
              {/* {payments.length > 0 && (
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {t("certificationRequest.payment.paymentDetails")}
                      </h3>
                      <p className="text-green-100 text-sm">
                        {payments.length}{" "}
                        {t("certificationRequest.payment.title")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-100">
                        {t("certificationRequest.payment.totalAmountDue")}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(totalPaymentAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              )} */}

              {payments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {payments.map((payment: Payment, index: number) => (
                    <div
                      key={payment.id || index}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      {/* Payment Header */}
                      <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Banknote className="h-5 w-5 text-green-600" />
                              <h3 className="text-xl font-bold text-gray-900">
                                {t("certificationRequest.payment.title")}{" "}
                                {index + 1}
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="inline-flex items-center gap-1 text-gray-600">
                                {/* <Hash className="h-4 w-4 text-gray-400" /> */}
                                <span className="font-medium">
                                  {t(
                                    "certificationRequest.payment.transactionId",
                                  )}
                                  :
                                </span>{" "}
                                {payment.transactionId || "-"}
                              </span>
                              <span className="inline-flex items-center gap-1 text-gray-600">
                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {t(
                                    "certificationRequest.payment.paymentDate",
                                  )}
                                  :
                                </span>{" "}
                                {formatShortDate(payment.paymentDate)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">
                              {t("certificationRequest.payment.paymentAmount")}
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(payment.paymentAmount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Attachments */}
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Paperclip className="h-5 w-5 text-blue-600" />
                          {t("certificationRequest.labels.attachments")} (
                          {payment.attachments?.length || 0})
                        </h4>
                        {payment.attachments &&
                        payment.attachments.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {payment.attachments.map(
                              (att: Attachment, idx: number) => (
                                <div
                                  key={att.id || idx}
                                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    {getFileTypeIcon(att.fileType)}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {getFileName(att)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(att.fileSize)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <a
                                      href={getFileUrl(att)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      {t("common.view")}
                                    </a>
                                    <a
                                      href={getFileUrl(att)}
                                      download
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      {t("common.download")}
                                    </a>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Paperclip className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">
                              {t("common.noDocuments")}
                            </p>
                            <p className="text-sm mt-1">
                              {t(
                                "certificationRequest.payment.uploadScannedBillRequired",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {t("certification.noPayments")}
                  </h3>
                  <p className="text-gray-500">
                    {t(
                      "certificationRequest.payment.uploadScannedBillRequired",
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Company Tab */}
          {activeTab === "company" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Company Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                  <div className="pt-16 px-4 sm:px-6 pb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {companyName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                            {t(`company.typeOptions.${company.companyType}`)}
                          </span>
                          {/* <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              company.active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                company.active ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                            {company.active
                              ? t("company.labels.active")
                              : t("company.labels.inactive")}
                          </span> */}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      <CompanyStatBox
                        label={t("company.labels.companyType")}
                        value={t(`company.typeOptions.${company.companyType}`)}
                      />
                      <CompanyStatBox
                        label={t("company.labels.ownerNameEn")}
                        value={company.companyOwnerNameEn || company[companyOwnerField]}
                      />
                      <CompanyStatBox
                        label={t("company.labels.ownerNameDr")}
                        value={company.companyOwnerNameDr}
                      />
                      <CompanyStatBox
                        label={t("company.labels.establishYear")}
                        value={formatShortDate(company.establishYear)}
                      />
                      <CompanyStatBox
                        label={t("company.labels.email")}
                        value={company.email}
                      />
                      <CompanyStatBox
                        label={t("company.labels.phoneNumber")}
                        value={
                          company.phoneNumber ? (
                            <span className={phoneDisplayClass} dir="ltr">
                              {company.phoneNumber}
                            </span>
                          ) : (
                            "-"
                          )
                        }
                      />
                      <CompanyStatBox
                        label={t("company.labels.mainBranchAddress")}
                        value={company.mainBranchAddress}
                      />
                      <CompanyStatBox
                        label={t("company.labels.activityPlace")}
                        value={company.activityPlace}
                      />
                      <CompanyStatBox
                        label={t("company.labels.activityType")}
                        value={company.activityType}
                      />
                      <CompanyStatBox
                        label={t("company.labels.categories")}
                        value={
                          company.categories
                            ?.map((category: Category) => category.categoryName)
                            .filter(Boolean)
                            .join(", ") || "-"
                        }
                      />
                      <CompanyStatBox
                        label={t("company.labels.jawazNumber")}
                        value={company.jawazNumber}
                      />
                      <CompanyStatBox
                        label={t("company.labels.jawazIssueDate")}
                        value={formatShortDate(company.jawazIssueDate)}
                      />
                      <CompanyStatBox
                        label={t("company.labels.jawazExpiryDate")}
                        value={formatShortDate(company.jawazExpiryDate)}
                      />
                      <CompanyStatBox
                        label={t("company.labels.tinNumber")}
                        value={company.tinNumber}
                      />
                      <CompanyStatBox
                        label={t("company.table.createdAt")}
                        value={formatDate(company.createdDate)}
                      />
                    </div>
                    <div className="mt-4 rounded-xl border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t("company.labels.address")}
                      </p>
                      <p className="text-xs sm:text-sm font-normal text-gray-800 break-words leading-relaxed">
                        {company.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* About Company */}
                <SectionCard
                  title={t("company.labels.aboutCompany")}
                  icon={<FileText />}
                  expanded={expandedSections.certificateInfo}
                  onToggle={() => toggleSection("companyAbout")}
                >
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {company?.[aboutCompanyField] || "-"}
                  </p>
                </SectionCard>

                {/* Company Categories */}
                {company.categories?.length > 0 && (
                  <SectionCard
                    title={`${t("company.labels.categories")} (${company.categories.length})`}
                    icon={<Tag />}
                    expanded={expandedSections.companyCategories}
                    onToggle={() => toggleSection("companyCategories")}
                  >
                    <div className="flex flex-wrap gap-2">
                      {company.categories.map((category: Category) => (
                        <span
                          key={category.id}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                        >
                          {category.categoryName}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {company.bussinessLogoUrl && (
                  <PlainCard
                    title={t("company.labels.businessLogo")}
                    icon={<Building2 />}
                  >
                    <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                      <img
                        src={assetUrl(company.bussinessLogoUrl)}
                        alt={t("company.labels.businessLogo")}
                        className="max-h-48 object-contain rounded-lg"
                      />
                    </div>
                  </PlainCard>
                )}
              </div>

              <div className="space-y-6">
                {/* <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10">
                    <Shield className="h-32 w-32" />
                  </div>
                  <Shield className="h-12 w-12 mb-4 relative z-10" />
                  <h3 className="text-xl font-bold mb-2 relative z-10">
                    {t("company.labels.verifiedCompany")}
                  </h3>
                  <p className="text-green-100 mb-4 relative z-10 text-sm">
                    {t("company.labels.verifiedMessage")}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm relative z-10 bg-white/20 rounded-lg px-3 py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t("company.labels.registeredMember")}</span>
                  </div>
                </div> */}

                <PlainCard
                  title={t("company.labels.companyStats")}
                  icon={<TrendingUp />}
                >
                  <div className="space-y-1">
                    <CompanyMiniStat
                      label={t("company.labels.companyType")}
                      value={t(`company.typeOptions.${company.companyType}`)}
                    />
                    <CompanyMiniStat
                      label={t("company.labels.categoriesCount")}
                      value={`${company.categories?.length || 0}`}
                    />
                    <CompanyMiniStat
                      label={t("company.labels.documentsCount")}
                      value={`${companyAttachments.length} `}
                    />
                    <CompanyMiniStat
                      label={t("company.labels.socialLinks")}
                      value={`${company.socialLinks?.length || 0} `}
                    />
                  </div>
                </PlainCard>

                <PlainCard
                  title={t("company.labels.quickContact")}
                  icon={<Phone />}
                >
                  <div className="space-y-3">
                    {company.email && (
                      <button
                        onClick={() =>
                          (window.location.href = `mailto:${company.email}`)
                        }
                        className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                      >
                        <Mail className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-700 flex-1 text-left break-all">
                          {company.email}
                        </span>
                        <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                    {company.phoneNumber && (
                      <button
                        onClick={() =>
                          (window.location.href = `tel:${company.phoneNumber}`)
                        }
                        className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                      >
                        <Phone className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                          <span className={phoneDisplayClass} dir="ltr">
                            {company.phoneNumber}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                    {company.websiteUrl && (
                      <button
                        onClick={() =>
                          window.open(company.websiteUrl, "_blank")
                        }
                        className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                      >
                        <Globe className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                          {t("company.labels.visitWebsite")}
                        </span>
                        <ChevronRight className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                  </div>
                </PlainCard>

                {/* Contact Person Card */}
                {contactPerson && Object.keys(contactPerson).length > 0 && (
                  <SectionCard
                    title={t("contactPerson.info")}
                    icon={<UserRound />}
                    expanded={expandedSections.contactPersonDetails}
                    onToggle={() => toggleSection("contactPersonDetails")}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                        <UserRound className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            {t("contactPerson.firstName")} &{" "}
                            {t("contactPerson.lastName")}
                          </p>
                          <p className="font-semibold text-gray-900">
                            {contactPerson.firstName || "-"}{" "}
                            {contactPerson.lastName || ""}
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

                    <div className="space-y-3 mb-6">
                      {contactPerson.email && (
                        <button
                          onClick={() =>
                            (window.location.href = `mailto:${contactPerson.email}`)
                          }
                          className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
                        >
                          <Mail className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              {t("contactPerson.email")}
                            </p>
                            <p className="font-medium text-gray-800 break-all">
                              {contactPerson.email}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                      {contactPerson.phoneNumber && (
                        <button
                          onClick={() =>
                            (window.location.href = `tel:${contactPerson.phoneNumber}`)
                          }
                          className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                        >
                          <Phone className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              {t("contactPerson.phoneNumber")}
                            </p>
                            <p className="font-medium text-gray-800">
                              <span className={phoneDisplayClass} dir="ltr">
                                {contactPerson.phoneNumber}
                              </span>
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                    </div>

                    {/* Contact Addresses */}
                    {contactPerson.addresses?.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <button
                          onClick={() => toggleSection("contactAddresses")}
                          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {t("contactPerson.addresses.title")} (
                              {contactPerson.addresses.length})
                            </h4>
                          </div>
                          {expandedSections.contactAddresses ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        {expandedSections.contactAddresses && (
                          <div className="space-y-3">
                            {contactPerson.addresses.map((address: Address) => (
                              <div
                                key={address.id}
                                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                    {getAddressIcon(address.addressType)}
                                    {labelize(address.addressType)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700 space-y-1">
                                  <p className="flex items-start gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                                    <span>
                                      {address.district?.districtName || "-"},{" "}
                                      {address.district?.province
                                        ?.provinceName || "-"}
                                    </span>
                                  </p>
                                  <p className="text-gray-600 pl-5">
                                    {address.details || "-"}
                                  </p>
                                  <p className="text-xs text-gray-500 pl-5">
                                    {address.district?.province?.country
                                      ?.countryName || "-"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </SectionCard>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttachmentCard
                title={t("certification.requestAttachments")}
                attachments={requestAttachments}
                getFileName={getFileName}
                getFileUrl={getFileUrl}
                formatFileSize={formatFileSize}
                emptyMessage={t("common.noDocuments")}
                getFileTypeIcon={getFileTypeIcon}
                t={t}
              />
              <AttachmentCard
                title={t("certification.certificateAttachments")}
                attachments={certificateAttachments}
                getFileName={getFileName}
                getFileUrl={getFileUrl}
                formatFileSize={formatFileSize}
                emptyMessage={t("common.noDocuments")}
                getFileTypeIcon={getFileTypeIcon}
                t={t}
              />
              <AttachmentCard
                title={t("company.labels.companyAttachments")}
                attachments={companyAttachments}
                getFileName={getFileName}
                getFileUrl={getFileUrl}
                formatFileSize={formatFileSize}
                emptyMessage={t("common.noDocuments")}
                getFileTypeIcon={getFileTypeIcon}
                t={t}
                showCurrentOldLabels
              />
              {/* <AttachmentCard
                title={t("certificationRequest.payment.scannedBill")}
                attachments={paymentAttachments}
                getFileName={getFileName}
                getFileUrl={getFileUrl}
                formatFileSize={formatFileSize}
                emptyMessage={t("common.noDocuments")}
                getFileTypeIcon={getFileTypeIcon}
              /> */}
            </div>
          )}
        </div>

        <CertificationUpdate
          visible={updateDialogVisible}
          certification={selectedCertification}
          onHide={() => setUpdateDialogVisible(false)}
          showToast={showToast}
          onUpdated={async () => {
            await loadDetails();
            setUpdateDialogVisible(false);
            showToast(
              "success",
              t("common.success"),
              t("certification.statusOptions.SCANNED"),
            );
          }}
        />
        <CompanyPdfExport
          ref={pdfExportRef}
          company={company}
          contactPersons={contactPerson?.id ? [contactPerson] : []}
          certificationRequests={request?.id ? [request] : []}
          certifications={details ? [details] : []}
          assetUrl={assetUrl}
          filename={`certification-${details?.id || "export"}.pdf`}
          authorityLogoSrc={`${window.location.origin}/asqanew.png`}
          fallbackLogoSrc={`${window.location.origin}/MOLSA-LOGO.png`}
        />
      </div>
    </>
  );
};

// Helper Components
const TimelineItem = ({
  icon,
  bg,
  title,
  date,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  date: string;
}) => (
  <div className="flex items-start gap-3">
    <div
      className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center shrink-0`}
    >
      {icon}
    </div>
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  </div>
);

const SectionCard = ({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-blue-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        {title}
      </h3>
      {expanded ? (
        <ChevronUp className="h-5 w-5 text-gray-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-400" />
      )}
    </button>
    {expanded && <div className="px-4 sm:px-6 pb-6">{children}</div>}
  </div>
);

const PlainCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-blue-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        {title}
      </h3>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

const InfoGrid = ({
  items,
}: {
  items: { icon: React.ReactNode; label: string; value?: any }[];
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map((item, index) => (
      <InfoBox
        key={index}
        icon={item.icon}
        label={item.label}
        value={item.value}
      />
    ))}
  </div>
);

const InfoBox = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: any;
}) => (
  <div className="rounded-xl border border-gray-200 p-3 min-w-0">
    <span className="text-blue-500 shrink-0 [&>svg]:h-5 [&>svg]:w-5">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-xs sm:text-sm font-normal text-gray-800 break-words leading-relaxed">
        {value || "-"}
      </p>
    </div>
  </div>
);

const CompanyStatBox = ({
  label,
  value,
  color: _color,
}: {
  label: string;
  value?: any;
  color?: string;
}) => {
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-xs sm:text-sm font-normal text-gray-800 break-words leading-relaxed">
        {value || "-"}
      </p>
    </div>
  );
};

const CompanyMiniStat = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0 gap-3">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900 px-2 py-1 bg-blue-50 rounded-lg text-sm text-right">
      {value || "-"}
    </span>
  </div>
);

const AttachmentCard = ({
  title,
  attachments,
  getFileName,
  getFileUrl,
  formatFileSize,
  emptyMessage,
  getFileTypeIcon,
  t,
  showCurrentOldLabels = false,
}: {
  title: string;
  attachments: Attachment[];
  getFileName: (attachment: Attachment) => string;
  getFileUrl: (attachment: Attachment) => string;
  formatFileSize: (bytes?: number) => string;
  emptyMessage: string;

  getFileTypeIcon: (fileType?: string) => React.ReactNode;
  t: TFunction;
  showCurrentOldLabels?: boolean;
}) => (
  <PlainCard title={`${title} (${attachments.length})`} icon={<File />}>
    {attachments.length > 0 ? (
      <div className="space-y-3">
        {attachments.map((attachment, index) => {
          const isCurrentDocument = showCurrentOldLabels && index === 0;

          return (
            <div
              key={attachment.id || index}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl hover:shadow-md transition-shadow group"
            >
            {/* <div className="flex items-center gap-3 min-w-0">
              {getFileTypeIcon(attachment.fileType)}
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {getFileName(attachment)}
                </p>
                     {attachment.attachmentReferenceType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                      {t(
                        `attachment.type.${attachment.attachmentReferenceType}`,
                      )}
                    </span>
                  )}
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>
            </div> */}
            <div className="flex items-center gap-3 flex-1">
              <File className="h-5 w-5 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900 truncate">
                    {attachment.attachmentName}
                  </p>
                  {showCurrentOldLabels && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        isCurrentDocument
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isCurrentDocument
                        ? t("common.currentDocument")
                        : t("common.oldDocument")}
                    </span>
                  )}
                  {attachment.attachmentReferenceType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                      {t(
                        `attachment.type.${attachment.attachmentReferenceType}`,
                      )}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={getFileUrl(attachment)}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
              </a>
              <a
                href={getFileUrl(attachment)}
                download
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-center text-gray-500 py-6">{emptyMessage}</p>
    )}
  </PlainCard>
);

export default CertificationDetails;
