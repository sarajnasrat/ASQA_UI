import type { ReactNode } from "react";

export interface Attachment {
  id: number;
  attachmentName: string;
  file: string;
  fileType: string;
  fileSize: number;
  attachmentReferenceType: string;
}

export interface Category {
  id: number;
  categoryName: string;
  categoryType: string | null;
}

export interface Address {
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

export interface ContactPerson {
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

export interface Company {
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

export interface Tracker {
  id: number;
  status: string;
  changedBy: string | null;
  changedAt: string;
  attachments: string | null;
}

export interface CertificationRequest {
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
  isPrint?: boolean;
  isScanned?: boolean;
  paymentAmount?: number | string;
  transactionId?: string;
  paymentDate?: string;
  paymentReceiptUrl?: string;
  certificationScope?: string;
  receiptFilePath?: string;
}

export interface StatusConfig {
  color: string;
  bgColor: string;
  icon: ReactNode;
  label: string;
}
