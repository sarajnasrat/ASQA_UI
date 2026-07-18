import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  RotateCcw,
  Shield,
  Users,
  XCircle,
} from "lucide-react";

import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import CommiteeAssignmentService from "../../../services/commitee-assignment.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import { CommiteeAssingmentUpdate } from "./CommiteeAssingmentUpdate";
import CommiteeAssignmentViewHeader from "./assignment-process/CommiteeAssignmentViewHeader";
import CommiteeAssignmentViewTabs from "./assignment-process/CommiteeAssignmentViewTabs";
import CommiteeAssignmentViewDetails from "./assignment-process/CommiteeAssignmentViewDetails";
import CommiteeAssignmentViewCompany from "./assignment-process/CommiteeAssignmentViewCompany";
import CommiteeAssignmentViewDocuments from "./assignment-process/CommiteeAssignmentViewDocuments";
import type { Assignment } from "./assignment-process/CommiteeAssignmentView.types";

const API_BASE_URL = import.meta.env.VITE_API_API || "http://localhost:8080";

const transitionMap: Record<string, string[]> = {
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
  ROLLED_BACK: [],
};

const rollbackOrder = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "STANDARDS_PROVIDED",
  "DEADLINE_REQUIRED",
  "DEADLINE_ASSIGNED",
  "INSPECTION_IN_PROGRESS",
  "REPORTED_TO_COMMITTEE",
  "REPORT_APPROVED",
  "APPROVAL_IN_PROGRESS",
  "COMMITTEE_APPROVED",
  "PAYMENT_PENDING",
  "PAYMENT_COMPLETED",
  "CERTIFICATE_ISSUED",
  "UNDER_SUPERVISION",
];

export const CommiteeAssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "company" | "documents"
  >("details");
  const [updateVisible, setUpdateVisible] = useState(false);
  const [preferredStatus, setPreferredStatus] = useState<string | null>(null);
  const [rollbackVisible, setRollbackVisible] = useState(false);
  const [rollbackStatus, setRollbackStatus] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    assignmentInfo: true,
    requestInfo: true,
    quickStats: true,
    contactPersonDetails: true,
  });

  const getDefaultReturnPath = () => {
    const committeeType = assignment?.committee?.committeeType?.toUpperCase();
    return committeeType === "APPROVAL"
      ? "/approval-commitee-assignment"
      : "/commitee-assignment-list";
  };

  const getReturnPath = () => {
    const from = (location.state as { from?: string } | null)?.from;
    return from || getDefaultReturnPath();
  };

  const loadAssignment = async () => {
    if (!id) return;
    setLoading(true);

    const response = await handleApi(
      () => CommiteeAssignmentService.getById(parseInt(id, 10)),
      () => {},
      showError,
      t,
    );

    if (response?.data?.data) {
      setAssignment(response.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const handleAssignmentStatusChange = async (
    newStatus: string,
    remarks?: string | null,
  ) => {
    if (!assignment?.id) return;

    const response = await handleApi(
      () =>
        CommiteeAssignmentService.patchUpdate(assignment.id, {
          assignmentStatus: newStatus,
          remarks: remarks || undefined,
        }),
      (summary, detail) =>
        showSuccess(
          summary || t("common.success"),
          detail || getStatusButtonLabel(newStatus),
        ),
      showError,
      t,
    );
    if (response?.status === 200) {
      navigate(getReturnPath());
      return;
    }
    if (response) {
      loadAssignment();
    }
  };

  const handleUpdateSuccess = () => {
    loadAssignment();
    setUpdateVisible(false);
    setPreferredStatus(null);

    navigate(getReturnPath());
  };

  const getNextStatuses = () => {
    if (!assignment?.assignmentStatus) return [];
    return transitionMap[assignment.assignmentStatus] || [];
  };

  const getRollbackOptions = () => {
    const status = request?.requestStatus?.toUpperCase();
    if (!status) return [];
    const currentIndex = rollbackOrder.indexOf(status);
    if (currentIndex <= 0) return [];

    return rollbackOrder.slice(0, currentIndex).reverse().map((value) => ({
      value,
      label: t(`certificationRequest.statusOptions.${value}`) || value,
    }));
  };

  const confirmStatusUpdate = (nextStatus: string) => {
    if (!assignment) return;

    if (nextStatus === "REJECTED" || nextStatus === "COMPLETED") {
      setPreferredStatus(nextStatus);
      setUpdateVisible(true);
      return;
    }

    confirmDialog({
      message:
        nextStatus === "IN_PROGRESS"
          ? t("commitee.assignment.confirmStartProgress")
          : t("commitee.assignment.confirmComplete"),
      header: t("common.confirmation"),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: t("commitee.assignment.yes"),
      rejectLabel: t("commitee.assignment.no"),
      accept: () => handleAssignmentStatusChange(nextStatus),
    });
  };

  const handleRollbackRequest = async () => {
    if (!request?.id || !rollbackStatus) return;

    const response = await handleApi(
      () =>
        CommiteeAssignmentService.rollbackRequest(
          request.id,
          rollbackStatus,
          request.company?.id,
        ),
      () =>
        showSuccess(
          t("common.success"),
          t("commitee.assignment.rollbackSuccess") || rollbackStatus,
        ),
      showError,
      t,
    );

    if (response?.status === 200) {
      setRollbackVisible(false);
      setRollbackStatus(null);
      loadAssignment();
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return IslamicDateFormatter.formatQamari(value, true);
  };
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusButtonLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      ASSIGNED: t("commitee.assignment.status.assinged"),
      IN_PROGRESS: t("commitee.assignment.status.in_progress"),
      COMPLETED: t("commitee.assignment.status.completed"),
      REJECTED: t("commitee.assignment.status.rejected"),
      ROLLED_BACK: t("commitee.assignment.status.rolled_back"),
    };

    return statusMap[status] || status;
  };

  const getAssignmentStatusConfig = (status?: string) => {
    const statusMap: Record<string, any> = {
      ASSIGNED: {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: <Users className="h-4 w-4" />,
        label: t("commitee.assignment.status.assinged"),
      },
      IN_PROGRESS: {
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        icon: <Clock className="h-4 w-4" />,
        label: t("commitee.assignment.status.in_progress"),
      },
      COMPLETED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-4 w-4" />,
        label: t("commitee.assignment.status.completed"),
      },
      REJECTED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
        label: t("commitee.assignment.status.rejected"),
      },
      ROLLED_BACK: {
        color: "text-orange-700",
        bgColor: "bg-orange-100",
        icon: <RotateCcw className="h-4 w-4" />,
        label: t("commitee.assignment.status.rolled_back"),
      },
    };

    return (
      statusMap[status || ""] || {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: status || "-",
      }
    );
  };

  const getRequestStatusConfig = (status?: string) => {
    const statusMap: Record<string, any> = {
      INSPECTION_IN_PROGRESS: {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: <Clock className="h-4 w-4" />,
        label: t("INSPECTION_IN_PROGRESS"),
      },
      UNDER_REVIEW: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("UNDER_REVIEW"),
      },
      REPORTED_TO_COMMITTEE: {
        color: "text-pink-700",
        bgColor: "bg-pink-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("REPORTED_TO_COMMITTEE"),
      },
      REPORT_APPROVED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-4 w-4" />,
        label: t("REPORT_APPROVED"),
      },
      REJECTED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
        label: t("REJECTED"),
      },
      PAYMENT_COMPLETED: {
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
        icon: <Shield className="h-4 w-4" />,
        label: t("PAYMENT_COMPLETED"),
      },
    };

    return (
      statusMap[status || ""] || {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: status || "-",
      }
    );
  };

  const getRequestTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      NEW: t("certificationRequest.typeOptions.NEW"),
      RENEWAL: t("certificationRequest.typeOptions.RENEWAL"),
      EXTENSION: t("certificationRequest.typeOptions.EXTENSION"),
    };
    return type ? types[type] || type : "-";
  };

  const getCertificationTypeLabel = (type?: string) => {
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
      SERVICE_QUALITY: t("certificationRequest.certificationTypeOptions.SERVICE_QUALITY"),
    };
    return type ? types[type] || type : "-";
  };

  const getCompanyName = () => {
    const company = assignment?.certificationRequest?.company;
    const lang = localStorage.getItem("i18nextLng") || "en";
    if (lang === "dr" && company?.companyNameDR) return company.companyNameDR;
    if (lang === "ps" && company?.companyNamePS) return company.companyNamePS;
    return company?.companyNameEN;
  };

  const getAboutCompany = () => {
    const company = assignment?.certificationRequest?.company;
    const lang = localStorage.getItem("i18nextLng") || "en";
    if (lang === "dr" && company?.aboutCompanyDr) return company.aboutCompanyDr;
    if (lang === "ps" && company?.aboutCompanyPs) return company.aboutCompanyPs;
    return company?.aboutCompanyEn;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
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

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("commitee.assignment.detailsNotFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("commitee.assignment.detailsNotFoundMessage")}
          </p>
          <button
            onClick={() => navigate(getReturnPath())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  const request = assignment.certificationRequest;
  const tracker = request?.trackers || [];
  const contactPerson =
    request?.contactPerson || request?.company?.contactPerson;
  const totalDocuments =
    (request?.attachments?.length || 0) +
    (request?.company?.attachments?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <ConfirmDialog />
      <div className="container mx-auto px-4 max-w-7xl">
        <CommiteeAssignmentViewHeader
          assignment={assignment}
          assignmentStatusConfig={getAssignmentStatusConfig(
            assignment.assignmentStatus,
          )}
          requestStatusConfig={getRequestStatusConfig(request?.requestStatus)}
          getNextStatuses={getNextStatuses}
          getStatusButtonLabel={getStatusButtonLabel}
          getCertificationTypeLabel={getCertificationTypeLabel}
          onRollbackRequest={() => setRollbackVisible(true)}
          onBack={() => navigate(getReturnPath())}
          onStatusAction={confirmStatusUpdate}
          onOpenEdit={() => {
            setPreferredStatus(null);
            setUpdateVisible(true);
          }}
          t={t}
        />

        <CommiteeAssignmentViewTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalDocuments={totalDocuments}
          t={t}
        />

        {activeTab === "details" && (
          <CommiteeAssignmentViewDetails
            assignment={assignment}
            tracker={tracker}
            expandedSections={{
              timeline: expandedSections.timeline,
              assignmentInfo: expandedSections.assignmentInfo,
              requestInfo: expandedSections.requestInfo,
              quickStats: expandedSections.quickStats,
            }}
            toggleSection={toggleSection}
            getAssignmentStatusConfig={getAssignmentStatusConfig}
            getRequestStatusConfig={getRequestStatusConfig}
            formatDate={formatDate}
            getRequestTypeLabel={getRequestTypeLabel}
            getCertificationTypeLabel={getCertificationTypeLabel}
            totalDocuments={totalDocuments}
            t={t}
          />
        )}

        {activeTab === "company" && (
          <CommiteeAssignmentViewCompany
            assignment={assignment}
            getCompanyName={getCompanyName}
            getAboutCompany={getAboutCompany}
            formatDate={formatDate}
            toggleSection={toggleSection}
            expandedSections={{
              contactPersonDetails: expandedSections.contactPersonDetails,
            }}
            contactPerson={contactPerson}
            apiBaseUrl={API_BASE_URL}
            t={t}
          />
        )}

        {activeTab === "documents" && (
          <CommiteeAssignmentViewDocuments
            assignment={assignment}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
            apiBaseUrl={API_BASE_URL}
            t={t}
          />
        )}
      </div>

      <CommiteeAssingmentUpdate
        visible={updateVisible}
        onHide={() => {
          setUpdateVisible(false);
          setPreferredStatus(null);
        }}
        assignmentId={assignment.id}
        currentStatus={assignment.assignmentStatus}
        preferredStatus={preferredStatus}
        onSuccess={handleUpdateSuccess}
      />

      <Dialog
        visible={rollbackVisible}
        onHide={() => {
          setRollbackVisible(false);
          setRollbackStatus(null);
        }}
        header={t("commitee.assignment.recommend")}
        style={{ width: "32rem" }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRollbackVisible(false);
                setRollbackStatus(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleRollbackRequest}
              disabled={!rollbackStatus}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50"
            >
              {t("common.save")}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {t("commitee.assignment.rollbackDescription")}
          </p>
          <Dropdown
            className="w-full"
            value={rollbackStatus}
            options={getRollbackOptions()}
            onChange={(e) => setRollbackStatus(e.value)}
            placeholder={t("commitee.assignment.rollbackSelect")}
          />
        </div>
      </Dialog>
    </div>
  );
};
