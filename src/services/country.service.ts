import httpClient from "../api/httpClient";

const USER_BASE = "/countries";

export const CountryService = {
  getAllCountries() {
    return httpClient.get(`${USER_BASE}`);
  },

  getPaginatedCountries(params: any) {
    return httpClient.get(`${USER_BASE}/getAll`, { params });
  },

  createCountry(data: any) {
    return httpClient.post(`${USER_BASE}`, data);
  },

  getCountry(id: any) {
    return httpClient.get(`${USER_BASE}/${id}`);
  },

  getCountryTranslation(id: any) {
    return httpClient.get(`${USER_BASE}/translation/${id}`);
  },

  updateCountry(id: any, data: any) {
    return httpClient.put(`${USER_BASE}/${id}`, data);
  },

  deleteCountry(id: any) {
    return httpClient.delete(`${USER_BASE}/${id}`);
  },
};

export default CountryService;