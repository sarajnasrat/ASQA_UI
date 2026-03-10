import httpClient from "../api/httpClient";

const PROVINCE_BASE = "/provinces";

export const ProvinceService = {
  // Get all provinces (no pagination)
  getAllProvinces(lang?: string) {
    return httpClient.get(`${PROVINCE_BASE}/all`, {
      headers: { "Accept-Language": lang || "en" },
    });
  },

  // Get provinces with pagination
  getPaginatedProvinces(params: any, lang?: string) {
    return httpClient.get(`${PROVINCE_BASE}/getAll`, {
      params,
      headers: { "Accept-Language": lang || "en" },
    });
  },

  // Get single province by ID
  getProvince(id: number | string, lang?: string) {
    return httpClient.get(`${PROVINCE_BASE}/${id}`, {
      headers: { "Accept-Language": lang || "en" },
    });
  },

  // Get province translation by ID
  getProvinceTranslation(id: number | string) {
    return httpClient.get(`${PROVINCE_BASE}/translation/${id}`);
  },

  // Create new province
  createProvince(data: any) {
    return httpClient.post(`${PROVINCE_BASE}`, data);
  },

  // Update province by ID
  updateProvince(id: number | string, data: any) {
    return httpClient.put(`${PROVINCE_BASE}/${id}`, data);
  },

  // Delete province by ID
  deleteProvince(id: number | string) {
    return httpClient.delete(`${PROVINCE_BASE}/${id}`);
  },

  // Get provinces by country ID
  getProvincesByCountryId(countryId: number | string, lang?: string) {
    return httpClient.get(`${PROVINCE_BASE}/by-country/${countryId}`, {
      headers: { "Accept-Language": lang || "en" },
    });
  },

  // Search provinces by name
  searchByProvinceName(name: string, params: any, lang?: string) {
    return httpClient.get(`${PROVINCE_BASE}/search`, {
      params: { name, ...params },
      headers: { "Accept-Language": lang || "en" },
    });
  },
};

export default ProvinceService;