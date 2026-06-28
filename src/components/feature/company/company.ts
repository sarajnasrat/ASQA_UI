export interface SocialLink {
  socialLinkName: string;
  address: string;
}

export interface CategoryReference {
  id: number;
  name?: string;
  categoryName?: string;
  categoryType?: string | null;
  jobCount?: number | null;
}

export type CompanyType =
  | "PRIVATE"
  | "PUBLIC"
  | "GOVERNMENT"
  | "EDUCATIONAL_INSTITUTIONS"
  | "OTHER"; // Adjust based on your backend

export interface Company {
  companyNameEN: string;
  companyNameDR: string;
  companyNamePS: string;
  onSuccess: () => void;
  onCancel: () => void;

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
  jawazExpiryDate?: Date | null;
  jawazIssueDate?: Date | null;
  tinNumber: string;
  websiteUrl?: string;

  establishYear?: Date | null;
  companyOwnerNameEn: string;
  companyOwnerNameDr: string;
  companyOwnerNamePs: string;

  companyType: CompanyType;

  aboutCompanyEn: string;
  aboutCompanyDr: string;
  aboutCompanyPs: string;

  categories: CategoryReference[];
  socialLinks: SocialLink[];
}
