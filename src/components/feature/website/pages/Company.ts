// components/feature/company/company.ts
export interface SocialLink {
  socialLinkName: string;
  address: string;
}

export interface CategoryReference {
  id: number;
  name?: string;
}

export type CompanyType = "PRIVATE" | "PUBLIC" | "GOVERNMENT" | "EDUCATIONAL_INSTITUTIONS" | "OTHER";

export interface Company {
  id?: number;
  companyNameEN: string;
  companyNameDR: string;
  companyNamePS: string;
  email: string;
  phoneNumber: string;
  address: string;
  logoUrl?: string;
  bussinessLogoUrl?: string;
  isActive: boolean;
  mainBranchAddress: string;
  activityPlace: string;
  activityType: string;
  jawazNumber: string;
  jawazExpiryDate: string;
  jawazIssueDate: string;
  tinNumber: string;
  websiteUrl?: string;
  establishYear: string;
  companyOwnerNameEn: string;
  companyOwnerNameDr: string;
  companyOwnerNamePs: string;
  companyType: CompanyType;
  aboutCompanyEn: string;
  aboutCompanyDr: string;
  aboutCompanyPs: string;
  categories: CategoryReference[];
  socialLinks: SocialLink[];
  createdAt?: string;
  updatedAt?: string;
}