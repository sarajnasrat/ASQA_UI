import httpClient from "../api/httpClient";

const REPORT_BASE = "/reports";

export enum ReportModule {
  USER = "USER",
  COMPANY = "COMPANY",
  COMMITTEE = "COMMITTEE",
  MENU = "MENU",
  CERTIFICATION = "CERTIFICATION",
  CERTIFICATION_REQUEST = "CERTIFICATION_REQUEST",
  ROLE = "ROLE",
  ATTACHMENT = "ATTACHMENT",
  COMPANY_CONTACT_PERSON = "COMPANY_CONTACT_PERSON",
  COMMITTEE_MEMBER = "COMMITTEE_MEMBER",
}

export enum RequestStatus {
  SUBMITTED = "SUBMITTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  CERTIFICATION_ISSUED = "CERTIFICATION_ISSUED",
}

export interface ReportFilterDTO {
  startDate?: string;
  endDate?: string;

  status?: RequestStatus;

  modules?: ReportModule[];
  companyClassifications?: CompanyClassificationType[];
  committeeTypes?: CommitteeType[];
}

export type CommitteeType = "APPROVAL" | "INSPECTION";

export type CompanyClassificationType =
  | "UNREVIEWED"
  | "WHITELISTED"
  | "BLACKLISTED"
  | "SUSPENDED";

export interface ReportResponseDTO {
  totalRequests?: number;

  totalUsers?: number;
  activeUsers?: number;
  inActiveUsers?: number;

  totalCompanies?: number;
  totalUnreviewedCompanies?: number;
  totalWhitelistedCompanies?: number;
  totalBlacklistedCompanies?: number;
  totalSuspendedCompanies?: number;

  totalCommitee?: number;
  totalApprovalCommittees?: number;
  totalInspectionCommittees?: number;

  totalMenu?: number;

  totalCertifications?: number;

  totalSubmittedRequest?: number;
  totalRejectedRequest?: number;
  inProgressRequest?: number;
  totalCompletedRequest?: number;

  totalRoles?: number;

  totalAttachments?: number;

  totalCompanyContactPersons?: number;

  totalCommitteeMembers?: number;
}

export const ReportService = {
  generateReport(filter?: ReportFilterDTO) {
    return httpClient.post<ReportResponseDTO>(
      `${REPORT_BASE}/generate`,
      filter
    );
  },
};

export default ReportService;
