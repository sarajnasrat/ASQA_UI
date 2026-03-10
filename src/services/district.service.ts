import httpClient from "../api/httpClient";

const DISTRICT_BASE = "/districts";

export const DistrictService = {
  getAllDistricts() {
    return httpClient.get(`${DISTRICT_BASE}`);
  },

  getPaginatedDistricts(params: any) {
    return httpClient.get(`${DISTRICT_BASE}/getAll`, { params });
  },

  createDistrict(data: any) {
    return httpClient.post(`${DISTRICT_BASE}`, data);
  },

  getDistrict(id: any) {
    return httpClient.get(`${DISTRICT_BASE}/${id}`);
  },

  getDistrictTranslation(id: any) {
    return httpClient.get(`${DISTRICT_BASE}/translate/${id}`);
  },

  updateDistrict(id: any, data: any) {
    return httpClient.put(`${DISTRICT_BASE}/${id}`, data);
  },

  deleteDistrict(id: any) {
    return httpClient.delete(`${DISTRICT_BASE}/${id}`);
  },
};

export default DistrictService;