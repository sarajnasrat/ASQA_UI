import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
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
};

export const CommiteeAssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "company" | "documents"
  >("details");
  const [updateVisible, setUpdateVisible] = useState(false);
  const [preferredStatus, setPreferredStatus] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    assignmentInfo: true,
    requestInfo: true,
    quickStats: true,
    contactPersonDetails: true,
  });

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
    if(response?.status==200) {
      navigate("commitee-assignment-list");
    }
    if (response) {
      loadAssignment();
    }
  };

  const handleUpdateSuccess = () => {
    showSuccess(
      t("common.success"),
      t("commitee.assignment.updatedSuccessfully") ||
        "Assignment updated successfully",
    );
    loadAssignment();
    setUpdateVisible(false);
    setPreferredStatus(null);
  };

  const getNextStatuses = () => {
    if (!assignment?.assignmentStatus) return [];
    return transitionMap[assignment.assignmentStatus] || [];
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
        label: t("certificationRequest.statusOptions.INSPECTION_IN_PROGRESS"),
      },
      UNDER_REVIEW: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.UNDER_REVIEW"),
      },
      REPORTED_TO_COMMITTEE: {
        color: "text-pink-700",
        bgColor: "bg-pink-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REPORTED_TO_COMMITTEE"),
      },
      REPORT_APPROVED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
      },
      REJECTED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REJECTED"),
      },
      PAYMENT_COMPLETED: {
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
        icon: <Shield className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"),
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
            onClick={() => navigate(-1)}
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
          onBack={() => navigate(-1)}
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
    </div>
  );
};
