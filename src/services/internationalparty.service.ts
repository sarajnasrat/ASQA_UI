import httpClient from "../api/httpClient";

const INTERNATIONAL_PARTY_BASE = "/international-parties";

export const InternationalPartyService = {
  getPaginatedInternationalParties(params?: any) {
    return httpClient.get(`${INTERNATIONAL_PARTY_BASE}`, { params });
  },

  getAllInternationalParties() {
    return httpClient.get(`${INTERNATIONAL_PARTY_BASE}/all`);
  },

  getInternationalPartyById(id: number) {
    return httpClient.get(`${INTERNATIONAL_PARTY_BASE}/${id}`);
  },

  createInternationalParty(data: any) {
    return httpClient.post(`${INTERNATIONAL_PARTY_BASE}`, data);
  },

  updateInternationalParty(id: number, data: any) {
    return httpClient.put(`${INTERNATIONAL_PARTY_BASE}/${id}`, data);
  },

  deleteInternationalParty(id: number) {
    return httpClient.delete(`${INTERNATIONAL_PARTY_BASE}/${id}`);
  },
};

export default InternationalPartyService;
