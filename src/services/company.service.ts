// src/services/company.service.ts
import httpClient from "../api/httpClient";
import type { Company } from "../components/feature/company/company";

const COMPANY_BASE = "/companies";

export const CompanyService = {
  /**
   * Get paginated companies
   * @param params Query params: page, size, sort, etc.
   */
  getPaginatedCompanies(params: any) {
    return httpClient.get(`${COMPANY_BASE}`, { params });
  },

  /**
   * Get all companies without pagination
   */
  getAllCompanies() {
    return httpClient.get(`${COMPANY_BASE}/all`);
  },

  /**
   * Get company by ID
   * @param id Company ID
   */
  getCompanyById(id: number) {
    return httpClient.get(`${COMPANY_BASE}/${id}`);
  },

  /**
   * Search companies by name (paginated)
   * @param name Company name to search
   * @param params Pagination params
   */
  searchCompanyByName(name: string, params: any) {
    return httpClient.get(`${COMPANY_BASE}/search`, { params: { name, ...params } });
  },

  /**
   * Create a new company
   * @param data Company object
   * @param companyLogo Optional company logo file
   * @param bussinessLogo Optional business logo file
   */
  createCompany(data: any) {
    return httpClient.post(`${COMPANY_BASE}/register-company`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Update existing company
   * @param id Company ID
   * @param data Company object
   * @param companyLogo Optional new company logo file
   * @param companyCover Optional company cover file
   */
  updateCompany(
    id: number,
    data: Company,
    companyLogo?: File,
    companyCover?: File
  ) {
    const formData = new FormData();
    formData.append("company", JSON.stringify(data));
    if (companyLogo) formData.append("companyLogo", companyLogo);
    if (companyCover) formData.append("companyCover", companyCover);

    return httpClient.put(`${COMPANY_BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Delete a company
   * @param id Company ID
   */
  deleteCompany(id: number) {
    return httpClient.delete(`${COMPANY_BASE}/${id}`);
  },
};

export default CompanyService;