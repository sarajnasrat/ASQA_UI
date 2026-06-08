import type { ReactNode } from "react";

export interface Attachment {
  id: number;
  attachmentName: string;
  file: string;
  fileType: string;
  fileSize: number;
  attachmentReferenceType?: string | null;
}

export interface Payment {
  id: number;
  transactionId?: string | null;
  paymentAmount?: number | null;
  paymentDate?: string | null;
  createdDate?: string | null;
}

export interface Tracker {
  id: number;
  status: string;
  changedBy?: string | null;
  changedAt: string;
}

export interface Address {
  id: number;
  details: string;
  addressType: string;
  district?: {
    districtName?: string;
    province?: {
      provinceName?: string;
      country?: {
        countryName?: string;
      };
    };
  };
}

export interface ContactPerson {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  addresses?: Address[];
}

export interface Category {
  id: number;
  categoryName: string;
}

export interface Company {
  id: number;
  companyNameEN?: string;
  companyNameDR?: string;
  companyNamePS?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
  activityPlace?: string;
  activityType?: string;
  jawazNumber?: string;
  jawazIssueDate?: string;
  jawazExpiryDate?: string;
  tinNumber?: string;
  establishYear?: string;
  companyOwnerNameEn?: string;
  aboutCompanyEn?: string;
  aboutCompanyDr?: string;
  aboutCompanyPs?: string;
  websiteUrl?: string;
  active?: boolean;
  companyType?: string;
  attachments?: Attachment[];
  categories?: Category[];
  contactPerson?: ContactPerson;
}

export interface CertificationRequest {
  id: number;
  requestType?: string;
  requestStatus?: string;
  certificationType?: string;
  serialNumber?: string;
  trackingNumber?: string;
  createdDate?: string;
  startDate?: string;
  endDate?: string;
  attachments?: Attachment[];
  payments?: Payment[];
  trackers?: Tracker[];
  company?: Company;
  contactPerson?: ContactPerson;
  isPrint?: boolean;
  isScanned?: boolean;
}

export interface Assignment {
  id: number;
  assignmentStatus: string;
  assignedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  deadlineStart?: string | null;
  deadlineEnd?: string | null;
  remarks?: string | null;
  createdDate?: string | null;
  certificationRequest?: CertificationRequest | null;
  committee?: {
    id: number;
    name?: string;
    committeeType?: string;
  } | null;
  assignedBy?: {
    id: number;
    firstName?: string;
    lastName?: string;
  } | null;
}

export interface StatusConfig {
  color: string;
  bgColor: string;
  icon: ReactNode;
  label: string;
}
