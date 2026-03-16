
export interface SocialLink {
  socialLinkName: string;
  address: string;
}

export interface CategoryReference {
  id: number;
  name: string;
} ;

export type CompanyType = "PRIVATE" | "PUBLIC" | "GOVERNMENT"|"EDUCATIONAL_INSTITUTIONS" | "OTHER"; // Adjust based on your backend

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
  jawazExpiryDate: string; // Use ISO string or Date if you want
  jawazIssueDate: string;  // Use ISO string or Date if you want

  tinNumber: string;
  websiteUrl?: string;

  establishYear: string; // ISO string (yyyy-mm-dd)
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