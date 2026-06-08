import httpClient from "../api/httpClient";

const ABOUT_US_BASE = "/about-us";

export const AboutUsService = {
  getPaginatedAboutUs(params?: any) {
    return httpClient.get(`${ABOUT_US_BASE}`, { params });
  },

  getAllAboutUs() {
    return httpClient.get(`${ABOUT_US_BASE}/all`);
  },

  getAboutUsById(id: number) {
    return httpClient.get(`${ABOUT_US_BASE}/${id}`);
  },

  createAboutUs(data: any) {
    return httpClient.post(`${ABOUT_US_BASE}`, data);
  },

  updateAboutUs(id: number, data: any) {
    return httpClient.put(`${ABOUT_US_BASE}/${id}`, data);
  },

  deleteAboutUs(id: number) {
    return httpClient.delete(`${ABOUT_US_BASE}/${id}`);
  },
};

export default AboutUsService;

