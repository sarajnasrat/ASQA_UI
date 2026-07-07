import httpClient from "../api/httpClient";
import i18n from "../i18n/i18n";

const USER_BASE = "/countries";

const withLanguage = (params?: Record<string, unknown>) => ({
  ...params,
  lang: i18n.language || "en",
});

export const CountryService = {
  getAllCountries() {
    return httpClient.get(`${USER_BASE}`, {
      params: withLanguage(),
    });
  },

  getPaginatedCountries(params: any) {
    return httpClient.get(`${USER_BASE}/getAll`, {
      params: withLanguage(params),
    });
  },

  createCountry(data: any) {
    return httpClient.post(`${USER_BASE}`, data);
  },

  getCountry(id: any) {
    return httpClient.get(`${USER_BASE}/${id}`, {
      params: withLanguage(),
    });
  },

  getCountryTranslation(id: any) {
    return httpClient.get(`${USER_BASE}/translation/${id}`, {
      params: withLanguage(),
    });
  },

  updateCountry(id: any, data: any) {
    return httpClient.put(`${USER_BASE}/${id}`, data);
  },

  deleteCountry(id: any) {
    return httpClient.delete(`${USER_BASE}/${id}`);
  },
};

export default CountryService;
