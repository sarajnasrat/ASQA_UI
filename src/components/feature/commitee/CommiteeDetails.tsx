import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useToast } from "../../../hooks/ToastContext";
import { handleApi } from "../../../hooks/handleApi";
import CommiteeService from "../../../services/comitee.service";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";

interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  phoneNumber: string | null;
  profileImage: string | null;
  zone?: {
    id: number;
    name: string;
  };
  roles: any[] | null;
  createdDate: string;
}

interface MemberType {
  id: number;
  user: UserType | null;
  committee: null;
  memberRole: string;
  responsibility: string;
  joinedAt: string;
  active: boolean;
}

interface CertificationRequestType {
  id: number;
  requestType: string;
  requestStatus: string;
  certificationType: string;
  serialNumber: string;
  trackingNumber: string;
  createdDate: string;
  attachments: any;
  payments: any;
  trackers: any;
  startDate: string;
  endDate: string;
  company: any;
  contactPerson: any;
  isPrint: boolean;
  isScanned: boolean;
}

interface AssignmentType {
  id: number;
  certificationRequest: CertificationRequestType | null;
  committee: any;
  assignedBy: any;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  deadlineStart: string | null;
  deadlineEnd: string | null;
  assignmentStatus: string;
  remarks: string;
  createdDate: string;
}

interface CommiteeDetailsType {
  id: number;
  name: string;
  description: string;
  committeeType: string;
  createdDate: string;
  active: boolean;
  memberCount: number;
  members: MemberType[];
  assignments: AssignmentType[];
}

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Helper function to format datetime
const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const CommiteeDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [commiteeDetails, setCommiteeDetails] =
    useState<CommiteeDetailsType | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "assignments">("members");
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const baseUrl = import.meta.env.VITE_API_API;

  const getCommiteeDetails = async (commiteeId: number) => {
    setLoading(true);

    try {
      const response: any = await handleApi(
        () => CommiteeService.getById(commiteeId),
        () => {},
        showError,
        t,
      );

      const committeeData = response?.data?.data || response?.data || response;

      if (committeeData?.id) {
        setCommiteeDetails(committeeData);
      } else {
        showError(
          t("common.error"),
          t("certificationRequest.loadFailed"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getCommiteeDetails(Number(id));
    }
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if no data
  if (!commiteeDetails) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 inline-block mb-4">
            <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium text-lg">
            {t("commitee.details.notFound") || "Committee not found"}
          </p>
        </div>
      </div>
    );
  }

  // Map committee type to translation key
  const getCommitteeTypeTranslation = (type: string) => {
    switch (type?.toLowerCase()) {
      case "technical":
        return t("commitee.technical");
      case "quality":
        return t("commitee.quality");
      case "administrative":
        return t("commitee.administrative");
      default:
        return type;
    }
  };

  // Map request type to readable text
  const getRequestTypeText = (type: string) => {
    switch (type?.toUpperCase()) {
      case "NEW":
        return t("certificationRequest.typeOptions.NEW");
      case "RENEWAL":
        return t("certificationRequest.typeOptions.RENEWAL");
      case "EXTENSION":
        return t("certificationRequest.typeOptions.EXTENSION");
      default:
        return type;
    }
  };

  // Map request status to badge configuration
  const getRequestStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "INSPECTION_IN_PROGRESS":
        return { text: t("certificationRequest.statusOptions.INSPECTION_IN_PROGRESS"), className: "bg-blue-100 text-blue-800" };
      case "UNDER_REVIEW":
        return { text: t("certificationRequest.statusOptions.UNDER_REVIEW"), className: "bg-yellow-100 text-yellow-800" };
      case "APPROVED":
        return { text: t("certificationRequest.statusOptions.REPORT_APPROVED"), className: "bg-green-100 text-green-800" };
      case "REJECTED":
        return { text: t("certificationRequest.statusOptions.REJECTED"), className: "bg-red-100 text-red-800" };
      case "COMPLETED":
        return { text: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"), className: "bg-purple-100 text-purple-800" };
      default:
        return { text: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  // Map certification type to readable text
  const getCertificationTypeText = (type: string) => {
    switch (type?.toUpperCase()) {
      case "DOMESTIC_QUALITY_CERTIFICATION":
        return t("certificationRequest.certificationTypeOptions.DOMESTIC_QUALITY_CERTIFICATION");
      case "INTERNATIONAL_QUALITY_CERTIFICATION":
        return t("certificationRequest.certificationTypeOptions.INTERNATIONAL_QUALITY_CERTIFICATION");
      case "STANDARD_MARK_CERTIFICATION":
        return t("certificationRequest.certificationTypeOptions.STANDARD_MARK_CERTIFICATION");
      default:
        return type;
    }
  };

  // Map member role to translation key with badges
  const getMemberRoleBadge = (role: string) => {
    const roleLower = role?.toUpperCase();
    switch (roleLower) {
      case "CHAIRPERSON":
        return { text: t("commitee.assignment.roles.CHAIRPERSON"), className: "bg-purple-100 text-purple-800" };
      case "MEMBER":
        return { text: t("commitee.assignment.roles.MEMBER"), className: "bg-blue-100 text-blue-800" };
      case "SECRETARY":
        return { text: t("commitee.assignment.roles.SECRETARY"), className: "bg-green-100 text-green-800" };
      default:
        return { text: role, className: "bg-gray-100 text-gray-800" };
    }
  };

  // Map assignment status to translation key
  const getAssignmentStatusTranslation = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return t("commitee.assignment.status.ACTIVE");
      case "INACTIVE":
        return t("commitee.assignment.status.INACTIVE");
      case "ASSINGED":
        return t("commitee.assignment.status.assinged");
      case "UNDER_REVIEW":
        return t("commitee.assignment.status.under_review");
      case "PINDING":
        return t("commitee.assignment.status.pinding");
      case "REJECTED":
        return t("commitee.assignment.status.rejected");
      case "IN_PROGRESS":
        return t("commitee.assignment.status.in_progress");
      case "COMPLETED":
        return t("commitee.assignment.status.completed");
      default:
        return status;
    }
  };

  const getAssignmentStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleAssignmentExpand = (assignmentId: number) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(assignmentId);
    }
  };

  const breadcrumbItems = [
    { label: t("commitee.list"), url: "/commitee-list" },
    { label: t("commitee.details.title"), url: `/commitee/view/${id}` },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
        <DynamicBreadcrumb
          items={breadcrumbItems}
          size="mb-4"
        />

        {/* Committee Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {commiteeDetails.name}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    commiteeDetails.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${commiteeDetails.active ? 'bg-green-600' : 'bg-red-600'} mr-1.5`}></span>
                  {commiteeDetails.active
                    ? t("commitee.details.active")
                    : t("commitee.details.inactive")}
                </span>
              </div>
              <p className="text-gray-600 mt-1 text-sm lg:text-base leading-relaxed">
                {commiteeDetails.description}
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3 lg:gap-4 mt-4 lg:mt-0">
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold text-blue-600">{commiteeDetails.memberCount}</div>
                <div className="text-xs text-gray-600 mt-1">{t("commitee.details.members")}</div>
              </div>
              <div className="bg-purple-50 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold text-purple-600">{commiteeDetails.assignments?.length || 0}</div>
                <div className="text-xs text-gray-600 mt-1">{t("commitee.details.assignments")}</div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{t("commitee.details.committeeType")}</div>
                <div className="text-sm font-medium text-gray-900 mt-0.5">
                  {getCommitteeTypeTranslation(commiteeDetails.committeeType)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{t("commitee.details.createdDate")}</div>
                <div className="text-sm font-medium text-gray-900 mt-0.5">
                  {formatDate(commiteeDetails.createdDate)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab("members")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-4 text-sm font-medium text-center transition-all duration-200 whitespace-nowrap ${
                  activeTab === "members"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{t("commitee.details.members")}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">
                    {commiteeDetails.members?.length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("assignments")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-4 text-sm font-medium text-center transition-all duration-200 whitespace-nowrap ${
                  activeTab === "assignments"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{t("commitee.details.assignments")}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">
                    {commiteeDetails.assignments?.length || 0}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="p-4 sm:p-6">
              {commiteeDetails.members?.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {commiteeDetails.members.map((member: MemberType) => {
                    const roleBadge = getMemberRoleBadge(member.memberRole);
                    return (
                      <div
                        key={member.id}
                        className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200 border border-gray-100"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="shrink-0">
                            {member.user?.profileImage ? (
                              <img
                                src={`${baseUrl}${member.user.profileImage}`}
                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                {member.user?.firstName?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                          
                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                              <h4 className="text-base font-semibold text-gray-900 truncate">
                                {member.user?.firstName} {member.user?.lastName}
                              </h4>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleBadge.className}`}>
                                {roleBadge.text}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 text-sm">
                              {member.user?.email && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{member.user.email}</span>
                                </div>
                              )}
                              
                              {member.user?.phoneNumber && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span>{member.user.phoneNumber}</span>
                                </div>
                              )}
                              
                              {member.responsibility && (
                                <div className="flex items-start gap-2 text-gray-600">
                                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="flex-1">{member.responsibility}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{t("commitee.details.joinedAt")}: {formatDate(member.joinedAt)}</span>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${member.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${member.active ? "bg-green-600" : "bg-red-600"}`}></span>
                                  {member.active ? t("commitee.details.active") : t("commitee.details.inactive")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500 text-lg">{t("commitee.details.noMembers")}</p>
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="p-4 sm:p-6">
              {commiteeDetails.assignments?.length > 0 ? (
                <div className="space-y-4">
                  {commiteeDetails.assignments.map((assignment: AssignmentType) => {
                    const isExpanded = expandedAssignment === assignment.id;
                    const hasCertification = !!assignment.certificationRequest;
                    
                    return (
                      <div
                        key={assignment.id}
                        className="bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        {/* Assignment Header */}
                        <div 
                          className="p-5 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                          onClick={() => toggleAssignmentExpand(assignment.id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm font-semibold text-gray-500 bg-white px-2 py-1 rounded">
                                #{assignment.id}
                              </span>
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getAssignmentStatusBadge(assignment.assignmentStatus)}`}>
                                {getAssignmentStatusTranslation(assignment.assignmentStatus)}
                              </span>
                              {hasCertification && (
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getRequestStatusBadge(assignment.certificationRequest!.requestStatus).className}`}>
                                  {getRequestStatusBadge(assignment.certificationRequest!.requestStatus).text}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="text-xs">
                                {formatDateTime(assignment.assignedAt)}
                              </span>
                              <svg 
                                className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Quick Info Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
                            {assignment.certificationRequest?.serialNumber && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                                <span className="text-xs text-gray-500">SN:</span>
                                <span className="font-mono text-xs">{assignment.certificationRequest.serialNumber}</span>
                              </div>
                            )}
                            {assignment.certificationRequest?.trackingNumber && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs text-gray-500">TN:</span>
                                <span className="font-mono text-xs">{assignment.certificationRequest.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-white p-5">
                            {/* Assignment Details */}
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {t("certificationRequest.requestDetails")}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <div className="text-xs text-gray-500">{t("commitee.details.assignedAt")}</div>
                                    <div className="text-gray-900">{formatDateTime(assignment.assignedAt)}</div>
                                  </div>
                                </div>
                                {assignment.completedAt && (
                                  <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                      <div className="text-xs text-gray-500">{t("commitee.details.completedAt")}</div>
                                      <div className="text-gray-900">{formatDateTime(assignment.completedAt)}</div>
                                    </div>
                                  </div>
                                )}
                                {assignment.startedAt && (
                                  <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                      <div className="text-xs text-gray-500">{t("assignment.startedAt") || "Started At"}</div>
                                      <div className="text-gray-900">{formatDateTime(assignment.startedAt)}</div>
                                    </div>
                                  </div>
                                )}
                                {assignment.deadlineStart && assignment.deadlineEnd && (
                                  <div className="flex items-start gap-2 md:col-span-2">
                                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                      <div className="text-xs text-gray-500">{t("commitee.assignment.deadline")}</div>
                                      <div className="text-gray-900 text-sm">
                                        {formatDateTime(assignment.deadlineStart)} - {formatDateTime(assignment.deadlineEnd)}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {assignment.remarks && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <div>
                                      <div className="text-xs text-gray-500">{t("commitee.details.remarks")}</div>
                                      <div className="text-gray-700 text-sm mt-0.5">{assignment.remarks}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Certification Request Details */}
                            {hasCertification && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                  {t("certificationRequest.requestInformation")}
                                </h4>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.labels.requestType")}</div>
                                      <div className="text-sm font-semibold text-gray-900 mt-1">{getRequestTypeText(assignment.certificationRequest!.requestType)}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.labels.serialNumber")}</div>
                                      <div className="text-sm font-mono text-gray-900 mt-1">{assignment.certificationRequest!.serialNumber}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.labels.trackingNumber")}</div>
                                      <div className="text-sm font-mono text-gray-900 mt-1">{assignment.certificationRequest!.trackingNumber}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.labels.certificationType")}</div>
                                      <div className="text-sm font-semibold text-gray-900 mt-1">{getCertificationTypeText(assignment.certificationRequest!.certificationType)}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.labels.createdDate")}</div>
                                      <div className="text-sm text-gray-900 mt-1">{formatDateTime(assignment.certificationRequest!.createdDate)}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.status")}</div>
                                      <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRequestStatusBadge(assignment.certificationRequest!.requestStatus).className}`}>
                                          {getRequestStatusBadge(assignment.certificationRequest!.requestStatus).text}
                                        </span>
                                      </div>
                                    </div>
                                    {assignment.certificationRequest!.startDate && (
                                      <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.labels.startDate")}</div>
                                        <div className="text-sm text-gray-900 mt-1">{formatDateTime(assignment.certificationRequest!.startDate)}</div>
                                      </div>
                                    )}
                                    {assignment.certificationRequest!.endDate && (
                                      <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{t("certificationRequest.labels.endDate")}</div>
                                        <div className="text-sm text-gray-900 mt-1">{formatDateTime(assignment.certificationRequest!.endDate)}</div>
                                      </div>
                                    )}
                                    <div className="flex gap-3 mt-2">
                                      {assignment.certificationRequest!.isPrint && (
                                        <div className="flex items-center gap-1">
                                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                          </svg>
                                          <span className="text-xs text-gray-600">{t("certificationRequest.printable")}</span>
                                        </div>
                                      )}
                                      {assignment.certificationRequest!.isScanned && (
                                        <div className="flex items-center gap-1">
                                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          <span className="text-xs text-gray-600">{t("certificationRequest.scanned")}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-4 text-gray-500 text-lg">{t("commitee.details.noAssignments")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};