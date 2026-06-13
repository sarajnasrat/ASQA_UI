import React from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Hash,
  XCircle,
} from "lucide-react";
import type { Assignment, StatusConfig } from "./CommiteeAssignmentView.types";
import { useAuth } from "../../../../context/AuthContext";
import { IslamicDateFormatter } from "../../../common/datepicker/IslamicDateFormatter";

interface Props {
  assignment: Assignment;
  assignmentStatusConfig: StatusConfig;
  requestStatusConfig: StatusConfig;
  getNextStatuses: () => string[];
  getStatusButtonLabel: (status: string) => string;
  getCertificationTypeLabel: (type?: string) => string;
  onBack: () => void;
  onStatusAction: (status: string) => void;
  onOpenEdit: () => void;
  t: any;
}

const CommiteeAssignmentViewHeader: React.FC<Props> = ({
  assignment,
  assignmentStatusConfig,
  requestStatusConfig,
  getNextStatuses,
  getStatusButtonLabel,
  getCertificationTypeLabel,
  onBack,
  onStatusAction,
  t,
}) => {
  const request = assignment.certificationRequest;
  const { hasPermission, withPermission } = useAuth();

  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        {t("common.back")}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {getCertificationTypeLabel(request?.certificationType)}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${assignmentStatusConfig.bgColor} ${assignmentStatusConfig.color}`}
              >
                {assignmentStatusConfig.icon}
                {assignmentStatusConfig.label}
              </span>
              {request?.requestStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${requestStatusConfig.bgColor} ${requestStatusConfig.color}`}
                >
                  {requestStatusConfig.icon}
                  {requestStatusConfig.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {/* <Hash className="h-4 w-4" />
                <span>
                  {t("commitee.assignment.details")} #{assignment.id}
                </span> */}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>
                  {t("certificationRequest.labels.serialNumber")}:{" "}
                  {request?.serialNumber || "-"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{assignment.committee?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("commitee.assignment.assignmentAt")}:{" "}
                  {assignment.assignedAt
                    ? IslamicDateFormatter.formatQamari(assignment.assignedAt)
                    : "-"}
                </span>
              </div>
            </div>
          </div>
          {hasPermission("UPDATE_CERTIFICATION") && (
            <div className="flex flex-col sm:flex-row gap-3  lg:w-auto">
              {getNextStatuses().map((nextStatus) => {
                const isReject = nextStatus === "REJECTED";

                return (
                  <button
                    key={nextStatus}
                    onClick={() => onStatusAction(nextStatus)}
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

              {/* {showEditButton && (
              <button
                onClick={onOpenEdit}
                className="flex items-center justify-center px-6 py-2.5 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto"
              >
                <Pencil className="h-4 w-4 mr-2" />
                {t("common.edit")}
              </button>
            )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommiteeAssignmentViewHeader;
