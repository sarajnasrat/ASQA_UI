// components/feature/certification/CertificationRequestDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import {
  FileText,
  Award,
  Building2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  File,
  Tag,
  Briefcase,
  Hash,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp,
  Home,
  Building,
  Map,
  ChevronRight,
} from "lucide-react";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useTranslation } from "react-i18next";
import CertificationRequestService from "../../../services/CertificationReques.service";
import CommiteeService from "../../../services/comitee.service";
import FileUploadField from "../../common/FileUploadField";
import { SmartDatePicker } from "../../common/datepicker/SmartDatePicker";

interface Attachment {
  id: number;
  attachmentName: string;
  file: string;
  fileType: string;
  fileSize: number;
  attachmentReferenceType: string;
}

interface Category {
  id: number;
  categoryName: string;
  categoryType: string | null;
}

interface Address {
  id: number;
  details: string;
  addressType: string;
  district: {
    id: number;
    districtName: string;
    province: {
      id: number;
      provinceName: string;
      country: {
        id: number;
        countryName: string;
        countryCode: string;
      };
    };
  };
}

interface ContactPerson {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  companyId: number | null;
  companyName: string | null;
  addresses: Address[];
}

interface Company {
  id: number;
  companyNameEN: string;
  companyNameDR: string;
  companyNamePS: string;
  email: string;
  phoneNumber: string;
  address: string;
  logoUrl: string;
  activityPlace: string;
  jawazNumber: string;
  jawazExpiryDate: string;
  jawazIssueDate: string;
  bussinessLogoUrl: string;
  aboutCompanyEn: string;
  aboutCompanyDr: string;
  aboutCompanyPs: string;
  websiteUrl: string;
  establishYear: string;
  companyOwnerNameEn: string;
  attachments?: Attachment[];
  categories: Category[];
  socialLinks: any[];
  active: boolean;
  companyType: string;
  contactPerson?: ContactPerson;
}

interface Tracker {
  id: number;
  status: string;
  changedBy: string | null;
  changedAt: string;
  attachments: string | null;
}

interface CertificationRequest {
  id: number;
  requestType: string;
  requestStatus: string;
  certificationType: string;
  serialNumber: string;
  trackingNumber: string;
  createdDate: string;
  startDate: string;
  endDate: string;
  attachments: Attachment[];
  company: Company;
  contactPerson?: ContactPerson;
  deadline?: string;
  trackers?: Tracker[];
}

const API_BASE_URL = "http://localhost:8080";

const transitionMap: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["STANDARDS_REQUIRED"],
  STANDARDS_REQUIRED: ["STANDARDS_PROVIDED"],
  STANDARDS_PROVIDED: ["DEADLINE_REQUIRED"],
  DEADLINE_REQUIRED: ["DEADLINE_ASSIGNED"],
  DEADLINE_ASSIGNED: ["INSPECTION_IN_PROGRESS"],
  INSPECTION_IN_PROGRESS: ["REPORTED_TO_COMMITTEE"],
  REPORTED_TO_COMMITTEE: ["REPORT_APPROVED", "REJECTED"],
  REPORT_APPROVED: ["PAYMENT_PENDING"],
  PAYMENT_PENDING: ["PAYMENT_COMPLETED"],
  PAYMENT_COMPLETED: ["CERTIFICATE_ISSUED"],
  CERTIFICATE_ISSUED: ["UNDER_SUPERVISION"],
};

const finalStates = ["UNDER_SUPERVISION", "REJECTED", "CANCELLED"];

const CertificationRequestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useAppToast();
  const [tracker, setTracker] = useState<Tracker[]>([]);
  const [request, setRequest] = useState<CertificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "company" | "documents"
  >("details");
  const [committees, setCommittees] = useState<any[]>([]);
  const [calendarType, setCalendarType] = useState<
    "gregorian" | "persian" | "arabic"
  >("gregorian");
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    requestInfo: true,
    quickStats: true,
    contactPersonDetails: true,
  });

  useEffect(() => {
    if (id) {
      loadRequestDetail();
    }
  }, [id]);

  useEffect(() => {
    const loadCommittees = async () => {
      try {
        const response = await CommiteeService.getAll();
        setCommittees(response?.data?.data || response?.data || []);
      } catch {
        showToast(
          "error",
          t("common.error"),
          t("committee.loadFailed") || "Failed to load committees",
        );
      }
    };

    loadCommittees();
  }, []);

  const loadRequestDetail = async () => {
    setLoading(true);
    const showSuccess = () => {};
    const showError = (message: string) => {
      showToast("error", t("common.error"), message);
    };

    const response = await handleApi(
      () => CertificationRequestService.getById(parseInt(id!)),
      showSuccess,
      showError,
      t,
    );

    if (response) {
      setRequest(response.data.data);
      setTracker(response.data.data.trackers || []);
    }
    setLoading(false);
  };

  const getNextStatuses = () => {
    if (!request?.requestStatus) return [];
    return transitionMap[request.requestStatus] || [];
  };

  const getStatusButtonLabel = (status: string) => {
    return t(`certificationRequest.statusOptions.${status}`) || status;
  };

  const getStatusConfirmationMessage = (status: string) => {
    const messages: Record<string, string> = {
      SUBMITTED: t("certificationRequest.confirmSubmit") || "Are you sure you want to submit this request?",
      CANCELLED: t("certificationRequest.confirmCancel") || "Are you sure you want to cancel this request?",
      UNDER_REVIEW: t("certificationRequest.requestWillBeUnderReview") || "This request will be moved to under review.",
      STANDARDS_REQUIRED: t("certificationRequest.standardRequired") || "Standards will be required for this request.",
      STANDARDS_PROVIDED: t("certificationRequest.standardsProvided") || "Please upload the standard document to continue.",
      DEADLINE_REQUIRED: t("certificationRequest.deadlineRequired") || "A deadline will be required for this request.",
      DEADLINE_ASSIGNED: t("certificationRequest.assignDeadline") || "Please assign the start and end deadline dates.",
      INSPECTION_IN_PROGRESS: t("certificationRequest.inspectionInProgress") || "Please assign a committee to start inspection.",
      REPORTED_TO_COMMITTEE: t("certificationRequest.reportToCommittee") || "This request will be reported to the committee.",
      REPORT_APPROVED: t("certificationRequest.reportApproved") || "The committee report will be approved.",
      PAYMENT_PENDING: t("certificationRequest.paymentPending") || "Payment will be marked as pending.",
      PAYMENT_COMPLETED: t("certificationRequest.paymentCompleted") || "Payment will be marked as completed.",
      CERTIFICATE_ISSUED: t("certificationRequest.certificateIssued") || "Certificate will be issued for this request.",
      UNDER_SUPERVISION: t("certificationRequest.underSupervision") || "This request will be moved under supervision.",
      REJECTED: t("certificationRequest.confirmReject") || "Please provide a rejection reason.",
    };

    return messages[status] || t("certificationRequest.confirmStatusUpdate") || "Are you sure you want to update this request status?";
  };

  const handleStatusUpdate = async (
    nextStatus: string,
    options?: {
      rejectionReason?: string | null;
      standardFile?: File | null;
      startDate?: Date | null;
      endDate?: Date | null;
      committeeId?: number | null;
    },
  ) => {
    if (!request?.id) return;

    const cleanReason = options?.rejectionReason?.trim() || "";

    const showSuccess = () => {
      showToast(
        "success",
        t("common.success"),
        getStatusButtonLabel(nextStatus),
      );
    };

    const showError = (message: string) => {
      showToast("error", t("common.error"), message);
    };

    let response;

    if (nextStatus === "REJECTED") {
      if (!cleanReason) {
        showToast(
          "warn",
          t("common.warning"),
          t("certificationRequest.enterRejectionReason"),
        );
        return;
      }

      const formData = new FormData();
      formData.append("status", nextStatus);
      formData.append("companyId", String(request.company?.id || 0));
      formData.append("rejectionReason", cleanReason);

      response = await handleApi(
        () =>
          CertificationRequestService.rejectCertificationRequest(
            request.id,
            formData,
          ),
        showSuccess,
        showError,
        t,
      );
    } else if (nextStatus === "STANDARDS_PROVIDED") {
      if (!options?.standardFile) {
        showToast(
          "warn",
          t("common.warning"),
          t("attachment.STANDARD") || "Please upload standard file",
        );
        return;
      }

      const formData = new FormData();
      formData.append("status", nextStatus);
      formData.append("companyId", String(request.company?.id || 0));
      formData.append("file", options.standardFile);

      response = await handleApi(
        () => CertificationRequestService.standardProvided(request.id, formData),
        showSuccess,
        showError,
        t,
      );
    } else if (nextStatus === "DEADLINE_ASSIGNED") {
      if (!options?.startDate || !options?.endDate) {
        showToast("warn", t("common.warning"), t("deadline.required"));
        return;
      }

      if (options.endDate < options.startDate) {
        showToast(
          "warn",
          t("common.warning"),
          "End date must be after start date",
        );
        return;
      }

      response = await handleApi(
        () =>
          CertificationRequestService.setDeadline(
            request.id,
            options.startDate!.toISOString(),
            options.endDate!.toISOString(),
          ),
        showSuccess,
        showError,
        t,
      );
    } else if (nextStatus === "INSPECTION_IN_PROGRESS") {
      if (!options?.committeeId) {
        showToast("warn", t("common.warning"), t("committee.required"));
        return;
      }

      response = await handleApi(
        () =>
          CertificationRequestService.assignCommittee(
            request.id,
            options.committeeId!,
          ),
        showSuccess,
        showError,
        t,
      );
    } else {
      const formData = new FormData();
      formData.append("status", nextStatus);
      formData.append("companyId", String(request.company?.id || 0));

      response = await handleApi(
        () => CertificationRequestService.updateStatus(request.id, formData),
        showSuccess,
        showError,
        t,
      );
    }

    if (response?.status === 200) {
      loadRequestDetail();
    }
  };

  const getCompanyName = () => {
    const lang = localStorage.getItem("i18nextLng") || "en";
    if (lang === "dr" && request?.company.companyNameDR)
      return request.company.companyNameDR;
    if (lang === "ps" && request?.company.companyNamePS)
      return request.company.companyNamePS;
    return request?.company.companyNameEN;
  };

  const getCertificationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      DOMESTIC_QUALITY_CERTIFICATION: t(
        "certificationRequest.certificationTypeOptions.DOMESTIC_QUALITY_CERTIFICATION",
      ),
      INTERNATIONAL_QUALITY_CERTIFICATION: t(
        "certificationRequest.certificationTypeOptions.INTERNATIONAL_QUALITY_CERTIFICATION",
      ),
      STANDARD_MARK_CERTIFICATION: t(
        "certificationRequest.certificationTypeOptions.STANDARD_MARK_CERTIFICATION",
      ),
    };
    return types[type] || type;
  };

  const confirmStatusUpdate = (nextStatus: string) => {
    const isReject = nextStatus === "REJECTED";
    const isStandardProvided = nextStatus === "STANDARDS_PROVIDED";
    const isDeadlineAssigned = nextStatus === "DEADLINE_ASSIGNED";
    const isInspectionInProgress = nextStatus === "INSPECTION_IN_PROGRESS";

    const requestType = getCertificationTypeLabel(
      request?.certificationType || "",
    );
    const requestId = request?.serialNumber || request?.trackingNumber || "";
    const companyName = getCompanyName() || "";

    let rejectionReasonValue = "";
    let selectedStandardFile: File | null = null;
    let selectedStartDate: Date | null = null;
    let selectedEndDate: Date | null = null;
    let selectedCommitteeId: number | null = null;

    confirmDialog({
      message: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    {t("certificationRequest.labels.requestType")}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {requestType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    {t("certificationRequest.labels.serialNumber")}
                  </span>
                  <span className="text-sm font-mono font-medium text-gray-800">
                    {requestId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    {t("company.labels.companyName")}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {companyName}
                  </span>
                </div>
              </div>

              <div
                className={`mt-3 p-4 rounded-lg text-sm ${
                  isReject
                    ? "bg-amber-50 text-amber-800 border border-amber-100"
                    : "bg-blue-50 text-blue-800 border border-blue-100"
                }`}
              >
                {isReject && (
                  <div className="flex flex-col gap-3">
                    <div className="w-full mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("certificationRequest.rejectReason") ||
                          "Rejection Reason"}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        onChange={(e) => {
                          rejectionReasonValue = e.target.value;
                        }}
                        placeholder={
                          t("certificationRequest.enterRejectionReason") ||
                          "Please provide a reason for rejection..."
                        }
                        className="w-full min-h-25 rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 resize-y"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {isStandardProvided && (
                  <div className="flex flex-col gap-3">
                    <FileUploadField
                      label={t("attachment.STANDARD")}
                      accept=".pdf,.jpg,.png"
                      maxFileSize={5000000}
                      required
                      onFileSelect={(file) => {
                        selectedStandardFile = file;
                      }}
                    />
                  </div>
                )}

                {isDeadlineAssigned && (
                  <>
                    <Dropdown
                      className="w-full mt-3"
                      value={calendarType}
                      options={[
                        { label: "Gregorian", value: "gregorian" },
                        { label: "Hijri", value: "arabic" },
                        { label: "Shamsi", value: "persian" },
                      ]}
                      onChange={(e) => setCalendarType(e.value)}
                    />

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <SmartDatePicker
                        label={t("deadline.startDate")}
                        value={selectedStartDate ?? undefined}
                        calendarType={calendarType}
                        onChange={(d: any) => {
                          selectedStartDate = d ? new Date(d?.date || d) : null;
                        }}
                      />

                      <SmartDatePicker
                        label={t("deadline.endDate")}
                        value={selectedEndDate ?? undefined}
                        calendarType={calendarType}
                        onChange={(d: any) => {
                          selectedEndDate = d ? new Date(d?.date || d) : null;
                        }}
                      />
                    </div>
                  </>
                )}

                {isInspectionInProgress && (
                  <Dropdown
                    className="w-full mt-3"
                    options={committees.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    onChange={(e) => {
                      selectedCommitteeId = e.value;
                    }}
                    placeholder={t("commitee.selectCommittee")}
                  />
                )}

                {!isReject &&
                  !isStandardProvided &&
                  !isDeadlineAssigned &&
                  !isInspectionInProgress && (
                    <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <strong>{getStatusButtonLabel(nextStatus)}</strong>
                      </div>
                      <span>{getStatusConfirmationMessage(nextStatus)}</span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      ),
      header: (
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 bg-white rounded-t-xl">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isReject ? "bg-red-100" : "bg-green-100"
            }`}
          >
            {isReject ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {getStatusButtonLabel(nextStatus)}
          </span>
        </div>
      ),
      accept: () => {
        if (isReject && !rejectionReasonValue.trim()) {
          showToast(
            "warn",
            t("common.warning"),
            t("certificationRequest.enterRejectionReason") ||
              "Please provide a rejection reason",
          );
          return;
        }

        if (isStandardProvided && !selectedStandardFile) {
          showToast(
            "warn",
            t("common.warning"),
            t("attachment.STANDARD") || "Please upload standard file",
          );
          return;
        }

        if (isDeadlineAssigned && (!selectedStartDate || !selectedEndDate)) {
          showToast("warn", t("common.warning"), t("deadline.required"));
          return;
        }

        if (
          isDeadlineAssigned &&
          selectedStartDate &&
          selectedEndDate &&
          selectedEndDate < selectedStartDate
        ) {
          showToast(
            "warn",
            t("common.warning"),
            "End date must be after start date",
          );
          return;
        }

        if (isInspectionInProgress && !selectedCommitteeId) {
          showToast("warn", t("common.warning"), t("committee.required"));
          return;
        }

        handleStatusUpdate(nextStatus, {
          rejectionReason: isReject ? rejectionReasonValue.trim() : null,
          standardFile: isStandardProvided ? selectedStandardFile : null,
          startDate: isDeadlineAssigned ? selectedStartDate : null,
          endDate: isDeadlineAssigned ? selectedEndDate : null,
          committeeId: isInspectionInProgress ? selectedCommitteeId : null,
        });
      },
      acceptLabel: isReject
        ? `✗ ${getStatusButtonLabel("REJECTED")}`
        : `✓ ${getStatusButtonLabel(nextStatus)}`,
      acceptClassName: isReject
        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        : "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md",
      rejectLabel: t("common.cancel") || "Cancel",
      rejectClassName:
        "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400",
      defaultFocus: "reject",
      closeOnEscape: true,
      dismissableMask: true,
      draggable: false,
      resizable: false,
      style: { width: "650px", maxWidth: "95vw" },
      contentStyle: { padding: "1.5rem" },
      breakpoints: { "960px": "95vw", "640px": "95vw" },
      className: "rounded-xl shadow-2xl border border-gray-200",
      headerClassName:
        "border-b border-gray-100 px-6 py-4 bg-white rounded-t-xl",
      contentClassName: "text-gray-700",
      footerClassName:
        "border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3",
    });
  };

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
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Approved",
      },
      REJECTED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REJECTED"),
      },
      CERTIFICATE_ISSUED: {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        icon: <Award className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.CERTIFICATE_ISSUED"),
      },
      STANDARDS_PROVIDED: {
        color: "text-cyan-700",
        bgColor: "bg-cyan-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.STANDARDS_PROVIDED"),
      },
      DEADLINE_ASSIGNED: {
        color: "text-orange-700",
        bgColor: "bg-orange-100",
        icon: <Calendar className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.DEADLINE_ASSIGNED"),
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
        icon: <CheckCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
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
        icon: <CheckCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"),
      },
      UNDER_SUPERVISION: {
        color: "text-slate-700",
        bgColor: "bg-slate-100",
        icon: <Shield className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.UNDER_SUPERVISION"),
      },
      CANCELLED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.CANCELLED"),
      },
      STANDARDS_REQUIRED: {
        color: "text-rose-700",
        bgColor: "bg-rose-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.STANDARDS_REQUIRED"),
      },
      DEADLINE_REQUIRED: {
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        icon: <Calendar className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.DEADLINE_REQUIRED"),
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

  const getRequestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      NEW: t("certificationRequest.typeOptions.NEW"),
      RENEWAL: t("certificationRequest.typeOptions.RENEWAL"),
      EXTENSION: t("certificationRequest.typeOptions.EXTENSION"),
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t("common.notSpecified");
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getAboutCompany = () => {
    const lang = localStorage.getItem("i18nextLng") || "en";
    if (lang === "dr" && request?.company.aboutCompanyDr)
      return request.company.aboutCompanyDr;
    if (lang === "ps" && request?.company.aboutCompanyPs)
      return request.company.aboutCompanyPs;
    return request?.company.aboutCompanyEn;
  };

  const getContactPerson = () => {
    return request?.contactPerson || request?.company?.contactPerson;
  };

  const getAddressTypeLabel = (addressType: string) => {
    const types: Record<string, string> = {
      HEAD_OFFICE: t("contactPerson.addresses.addressTypes.HEAD_OFFICE"),
      BRANCH_OFFICE: t("contactPerson.addresses.addressTypes.BRANCH_OFFICE"),
      HOME: t("contactPerson.addresses.addressTypes.HOME"),
      OTHER: t("contactPerson.addresses.addressTypes.OTHER"),
    };
    return types[addressType] || addressType;
  };

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

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("common.notFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("certificationRequest.loadFailed")}
          </p>
          <button
            onClick={() => navigate("/certification-request-requests")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.requestStatus);
  const hasAttachments =
    (request.attachments?.length || 0) +
      (request.company?.attachments?.length || 0) >
    0;
  const contactPerson = getContactPerson();

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-10">
      <ConfirmDialog />
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
                    {getCertificationTypeLabel(request.certificationType)}
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
                    <Hash className="h-4 w-4" />
                    <span>
                      {t("certificationRequest.labels.serialNumber")}:{" "}
                      {request.serialNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>
                      {t("certificationRequest.labels.trackingNumber")}:{" "}
                      {request.trackingNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {t("certificationRequest.labels.createdDate")}:{" "}
                      {formatDate(request.createdDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {!finalStates.includes(request.requestStatus) &&
                  getNextStatuses().map((nextStatus) => {
                    const isReject = nextStatus === "REJECTED";

                    return (
                      <button
                        key={nextStatus}
                        onClick={() => confirmStatusUpdate(nextStatus)}
                        className={`flex items-center justify-center px-6 py-2.5 border-2 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto ${
                          isReject
                            ? "border-red-600 text-red-700 hover:bg-red-50 active:bg-red-100"
                            : "border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100"
                        }`}
                      >
                        {isReject ? (
                          <XCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {getStatusButtonLabel(nextStatus)}
                      </button>
                    );
                  })}

                <button
                  className="flex items-center justify-center px-6 py-2.5 border-2 border-gray-400 text-gray-700 hover:bg-gray-50
                 active:bg-gray-100 font-medium rounded-lg transition-all duration-200  w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("common.download")}
                </button>
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
                label: t("certificationRequest.labels.requestDetails"),
                icon: <FileText className="h-4 w-4" />,
              },
              {
                id: "company",
                label: t("company.labels.companyInfo"),
                icon: <Building2 className="h-4 w-4" />,
              },
              {
                id: "documents",
                label: t("certificationRequest.labels.attachments"),
                icon: <File className="h-4 w-4" />,
                badge: hasAttachments
                  ? (request.attachments?.length || 0) +
                    (request.company?.attachments?.length || 0)
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
                    ? "Details"
                    : tab.id === "company"
                      ? "Company"
                      : "Docs"}
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

        {/* Tab Content - Request Details */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline and Info - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection("timeline")}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Timeline
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
                      {tracker && tracker.length > 0 ? (
                        tracker.map((item: Tracker, index: number) => {
                          const statusConfig = getStatusConfig(item.status);
                          const isLastItem = index === tracker.length - 1;

                          return (
                            <div
                              key={item.id}
                              className="flex items-start gap-3"
                            >
                              <div className="relative">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    statusConfig.bgColor || "bg-gray-100"
                                  }`}
                                >
                                  {statusConfig.icon || (
                                    <Clock className="h-4 w-4" />
                                  )}
                                </div>
                                {!isLastItem && (
                                  <div className="absolute top-8 left-4 w-0.5 h-12 bg-gray-200"></div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {statusConfig.label || item.status}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(item.changedAt)}
                                </p>
                                {item.changedBy && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    By: {item.changedBy}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {t(
                                "certificationRequest.statusOptions.SUBMITTED",
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(request.createdDate)}
                            </p>
                          </div>
                        </div>
                      )}
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
                    <Tag className="h-5 w-5 text-blue-600" />
                    {t("certificationRequest.labels.requestInfo")}
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
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t("certificationRequest.labels.requestType")}
                        </p>
                        <p className="font-medium text-gray-900">
                          {getRequestTypeLabel(request.requestType)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t("certificationRequest.labels.certificationType")}
                        </p>
                        <p className="font-medium text-gray-900">
                          {getCertificationTypeLabel(request.certificationType)}
                        </p>
                      </div>
                      {request.startDate && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            {t("common.startDate")}
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(request.startDate)}
                          </p>
                        </div>
                      )}
                      {request.endDate && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            {t("common.endDate")}
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(request.endDate)}
                          </p>
                        </div>
                      )}
                      {request.deadline && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            {t("certificationRequest.labels.deadline")}
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(request.deadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Card - Right Side */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                <Award className="h-12 w-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">
                  {t("certificationRequest.progress")}
                </h3>
                <p className="text-blue-100 mb-4">
                  {t("certificationRequest.reviewMessage")}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t("common.completion")}</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleSection("quickStats")}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    {t("common.quickStats")}
                  </h3>
                  {expandedSections.quickStats ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.quickStats && (
                  <div className="px-6 pb-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {t("certificationRequest.labels.totalDocuments")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {hasAttachments
                            ? (request.attachments?.length || 0) +
                              (request.company?.attachments?.length || 0)
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {t("common.processingTime")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatDate(request?.startDate)} -{" "}
                          {formatDate(request?.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Company Information Tab */}
        {activeTab === "company" && request.company && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Profile - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Company Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="relative h-32 bg-linear-to-r from-blue-600 to-indigo-600">
                  <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                      {request.company.logoUrl ? (
                        <img
                          src={`${API_BASE_URL}${request.company.logoUrl}`}
                          alt={request.company.companyNameEN}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-12 w-12 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-16 px-6 pb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {getCompanyName()}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                          {request.company.companyType?.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            request.company.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${request.company.active ? "bg-green-500" : "bg-gray-400"}`}
                          ></div>
                          {request.company.active
                            ? t("company.labels.active")
                            : t("company.labels.inactive")}
                        </span>
                      </div>
                    </div>
                    {request.company.websiteUrl && (
                      <a
                        href={request.company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm"
                      >
                        <Globe className="h-4 w-4" />
                        {t("company.labels.visitWebsite")}
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t("company.labels.email")}
                        </p>
                        <p className="font-medium text-gray-900 break-all">
                          {request.company.email}
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
                          {request.company.phoneNumber}
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
                          {request.company.address}
                        </p>
                      </div>
                    </div>
                  </div>

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
                          {request.company.jawazNumber}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                        <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">
                          {t("company.labels.jawazIssueDate")}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatDate(request.company.jawazIssueDate)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                        <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">
                          {t("company.labels.jawazExpiryDate")}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatDate(request.company.jawazExpiryDate)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-green-600 uppercase tracking-wide mb-1">
                          {t("company.labels.establishYear")}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatDate(request.company.establishYear)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-4">
                        <p className="text-xs text-cyan-600 uppercase tracking-wide mb-1">
                          {t("company.labels.activityPlace")}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {request.company.activityPlace}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
                          {t("company.labels.ownerNameEn")}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {request.company.companyOwnerNameEn}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Company Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t("company.labels.aboutCompany")}
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {getAboutCompany()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories Card */}
              {request.company.categories &&
                request.company.categories.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-600" />
                        {t("company.labels.categories")}
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {request.company.categories.map((category) => (
                          <span
                            key={category.id}
                            className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow cursor-default"
                          >
                            {category.categoryName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Business Logo if exists */}
              {request.company.bussinessLogoUrl && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {t("company.labels.businessLogo")}
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                      <img
                        src={`${API_BASE_URL}${request.company.bussinessLogoUrl}`}
                        alt="Business Logo"
                        className="max-h-48 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Stats & Info - Right Side */}
            <div className="space-y-6">
              {/* Verified Badge Card */}
              <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
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
                <div className="flex items-center gap-2 text-sm relative z-10 bg-white/20 rounded-lg px-3 py-2 inline-flex">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t("company.labels.registeredMember")}</span>
                </div>
              </div>

              {/* Company Statistics Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    {t("company.labels.companyStats")}
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600">
                      {t("company.labels.companyType")}
                    </span>
                    <span className="font-semibold text-gray-900 px-2 py-1 bg-blue-50 rounded-lg text-sm">
                      {request.company.companyType?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600">
                      {t("company.labels.categoriesCount")}
                    </span>
                    <span className="font-semibold text-gray-900 px-2 py-1 bg-purple-50 rounded-lg text-sm">
                      {request.company.categories?.length || 0}{" "}
                      {t("company.labels.categories")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600">
                      {t("company.labels.documentsCount")}
                    </span>
                    <span className="font-semibold text-gray-900 px-2 py-1 bg-green-50 rounded-lg text-sm">
                      {request.company.attachments?.length || 0}{" "}
                      {t("company.labels.documents")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">
                      {t("company.labels.socialLinks")}
                    </span>
                    <span className="font-semibold text-gray-900 px-2 py-1 bg-amber-50 rounded-lg text-sm">
                      {request.company.socialLinks?.length || 0}{" "}
                      {t("company.labels.links")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    {t("company.labels.quickContact")}
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <button
                    onClick={() =>
                      (window.location.href = `mailto:${request.company.email}`)
                    }
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                  >
                    <Mail className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                      {request.company.email}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = `tel:${request.company.phoneNumber}`)
                    }
                    className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                  >
                    <Phone className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                      {request.company.phoneNumber}
                    </span>
                  </button>
                  {request.company.websiteUrl && (
                    <button
                      onClick={() =>
                        window.open(request.company.websiteUrl, "_blank")
                      }
                      className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                    >
                      <Globe className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                        {t("company.labels.visitWebsite")}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Person Card */}
              {contactPerson && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleSection("contactPersonDetails")}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <User className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {t("contactPerson.firstName")} &{" "}
                              {t("contactPerson.lastName")}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {contactPerson.firstName} {contactPerson.lastName}
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
                        <button
                          onClick={() =>
                            (window.location.href = `mailto:${contactPerson.email}`)
                          }
                          className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
                        >
                          <Mail className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 text-left">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              {t("contactPerson.email")}
                            </p>
                            <p className="font-medium text-gray-800 group-hover:text-gray-900">
                              {contactPerson.email}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button
                          onClick={() =>
                            (window.location.href = `tel:${contactPerson.phoneNumber}`)
                          }
                          className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                        >
                          <Phone className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 text-left">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              {t("contactPerson.phoneNumber")}
                            </p>
                            <p className="font-medium text-gray-800 group-hover:text-gray-900">
                              {contactPerson.phoneNumber}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>

                      {contactPerson.addresses &&
                        contactPerson.addresses.length > 0 && (
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <h4 className="font-semibold text-gray-800 text-sm">
                                {t("contactPerson.addresses.title")}
                              </h4>
                            </div>
                            <div className="space-y-3">
                              {contactPerson.addresses.map(
                                (address: Address, index: number) => (
                                  <div
                                    key={address.id || index}
                                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                        {address.addressType === "HOME" && (
                                          <Home className="h-3 w-3" />
                                        )}
                                        {address.addressType ===
                                          "HEAD_OFFICE" && (
                                          <Building className="h-3 w-3" />
                                        )}
                                        {address.addressType ===
                                          "BRANCH_OFFICE" && (
                                          <Building2 className="h-3 w-3" />
                                        )}
                                        {address.addressType === "OTHER" && (
                                          <Map className="h-3 w-3" />
                                        )}
                                        {getAddressTypeLabel(
                                          address.addressType,
                                        )}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-1">
                                      <p className="flex items-start gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span>
                                          {address.district?.districtName},{" "}
                                          {
                                            address.district?.province
                                              ?.provinceName
                                          }
                                        </span>
                                      </p>
                                      <p className="text-gray-600 pl-5">
                                        {address.details}
                                      </p>
                                      <p className="text-xs text-gray-500 pl-5">
                                        {
                                          address.district?.province?.country
                                            ?.countryName
                                        }
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
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
                {t("certificationRequest.requestAttachments")} (
                {request.attachments?.length || 0})
              </h3>
              {request.attachments && request.attachments.length > 0 ? (
                <div className="space-y-3">
                  {request.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <File className="h-5 w-5 text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 truncate">
                              {attachment.attachmentName}
                            </p>
                            {attachment.attachmentReferenceType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                {attachment.attachmentReferenceType}
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

                      <div className="flex gap-2 flex-shrink-0">
                        <a
                          href={`${API_BASE_URL}${attachment.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                          title={t("common.view")}
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={`${API_BASE_URL}${attachment.file}`}
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
                  <p className="text-gray-500">{t("common.noDocuments")}</p>
                </div>
              )}
            </div>

            {/* Company Attachments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {t("company.labels.companyAttachments")} (
                {request.company?.attachments?.length || 0})
              </h3>
              {request.company &&
              request.company.attachments &&
              request.company.attachments.length > 0 ? (
                <div className="space-y-3">
                  {request.company.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {attachment.attachmentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`${API_BASE_URL}${attachment.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                          title={t("common.view")}
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={`${API_BASE_URL}${attachment.file}`}
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
                  <p className="text-gray-500">{t("common.noDocuments")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationRequestView;
