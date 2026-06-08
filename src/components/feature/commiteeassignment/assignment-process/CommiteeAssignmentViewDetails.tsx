import React from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Assignment, Tracker } from "./CommiteeAssignmentView.types";

type DetailsSection =
  | "timeline"
  | "assignmentInfo"
  | "requestInfo"
  | "quickStats";

interface Props {
  assignment: Assignment;
  tracker: Tracker[];
  expandedSections: Record<DetailsSection, boolean>;
  toggleSection: (section: DetailsSection) => void;
  getAssignmentStatusConfig: (status?: string) => {
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    label: string;
  };
  getRequestStatusConfig: (status?: string) => {
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    label: string;
  };
  formatDate: (value?: string | null) => string;
  getRequestTypeLabel: (type?: string) => string;
  getCertificationTypeLabel: (type?: string) => string;
  totalDocuments: number;
  t: any;
}

const CommiteeAssignmentViewDetails: React.FC<Props> = ({
  assignment,
  tracker,
  expandedSections,
  toggleSection,
  getAssignmentStatusConfig,
  getRequestStatusConfig,
  formatDate,
  getRequestTypeLabel,
  getCertificationTypeLabel,
  totalDocuments,
  t,
}) => {
  const request = assignment.certificationRequest;
  const payments = request?.payments || [];
  const assignedByName = assignment.assignedBy
    ? `${assignment.assignedBy.firstName || ""} ${assignment.assignedBy.lastName || ""}`.trim()
    : "-";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getAssignmentStatusConfig(assignment.assignmentStatus).label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(assignment.assignedAt)}
                  </p>
                </div>
              </div>

              {tracker.map((item) => {
                const statusConfig = getRequestStatusConfig(item.status);

                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}
                    >
                      {statusConfig.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {statusConfig.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(item.changedAt)}
                      </p>
                      {item.changedBy && (
                        <p className="text-xs text-gray-400 mt-1">
                          {t("commitee.assignment.byLabel")} {item.changedBy}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {assignment.startedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("commitee.assignment.status.in_progress")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(assignment.startedAt)}
                    </p>
                  </div>
                </div>
              )}

              {assignment.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("commitee.assignment.status.completed")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(assignment.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection("assignmentInfo")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              {t("commitee.assignment.details")}
            </h3>
            {expandedSections.assignmentInfo ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.assignmentInfo && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("common.status")}</p>
                  <p className="font-medium text-gray-900">
                    {getAssignmentStatusConfig(assignment.assignmentStatus).label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("commitee.name")}</p>
                  <p className="font-medium text-gray-900">
                    {assignment.committee?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("commitee.assignment.assignmentBy")}
                  </p>
                  <p className="font-medium text-gray-900">{assignedByName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("commitee.assignment.assignmentAt")}
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatDate(assignment.assignedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("common.startDate")}</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(assignment.deadlineStart)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("common.endDate")}</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(assignment.deadlineEnd)}
                  </p>
                </div>
              </div>

              {assignment.remarks && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("commitee.assignment.reason")}
                  </p>
                  <p className="text-gray-900">{assignment.remarks}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection("requestInfo")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
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
                    {getRequestTypeLabel(request?.requestType)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("certificationRequest.labels.certificationType")}
                  </p>
                  <p className="font-medium text-gray-900">
                    {getCertificationTypeLabel(request?.certificationType)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("certificationRequest.labels.serialNumber")}
                  </p>
                  <p className="font-medium text-gray-900">
                    {request?.serialNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("certificationRequest.labels.trackingNumber")}
                  </p>
                  <p className="font-medium text-gray-900">
                    {request?.trackingNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("certificationRequest.labels.createdDate")}
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatDate(request?.createdDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("common.status")}</p>
                  <p className="font-medium text-gray-900">
                    {getRequestStatusConfig(request?.requestStatus).label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("common.startDate")}</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(request?.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("common.endDate")}</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(request?.endDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
          <Users className="h-12 w-12 mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">
            {t("commitee.assignment.details")}
          </h3>
          <p className="text-blue-100 mb-4">
            {assignment.committee?.name || "-"}
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>{t("common.status")}</span>
              <span>{getAssignmentStatusConfig(assignment.assignmentStatus).label}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("commitee.assignment.assignmentAt")}</span>
              <span>{formatDate(assignment.assignedAt)}</span>
            </div>
          </div>
        </div>

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
            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("certificationRequest.labels.totalDocuments")}
                </span>
                <span className="font-semibold text-gray-900">{totalDocuments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("commitee.assignment.payments")}
                </span>
                <span className="font-semibold text-gray-900">{payments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("commitee.assignment.timelineEvents")}
                </span>
                <span className="font-semibold text-gray-900">
                  {tracker.length + 1}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("commitee.assignment.schedule")}
                </span>
                <span className="font-semibold text-gray-900 text-right">
                  {formatDate(assignment.deadlineStart)} - {formatDate(assignment.deadlineEnd)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-blue-600" />
            {t("commitee.assignment.payments")}
          </h3>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <p className="font-medium text-gray-900">
                    {payment.transactionId || `#${payment.id}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {payment.paymentAmount ?? "-"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(payment.paymentDate || payment.createdDate)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {t("commitee.assignment.noPaymentRecords")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommiteeAssignmentViewDetails;
