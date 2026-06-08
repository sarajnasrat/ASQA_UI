import httpClient from "../api/httpClient";

const CONTACT_US_BASE = "/contact-us";

export const ContactUsService = {
  getPaginatedContactUs(params?: any) {
    return httpClient.get(`${CONTACT_US_BASE}`, { params });
  },

  getAllContactUs() {
    return httpClient.get(`${CONTACT_US_BASE}/all`);
  },

  getContactUsById(id: number) {
    return httpClient.get(`${CONTACT_US_BASE}/${id}`);
  },

  createContactUs(data: any) {
    return httpClient.post(`${CONTACT_US_BASE}`, data);
  },

  updateContactUs(id: number, data: any) {
    return httpClient.put(`${CONTACT_US_BASE}/${id}`, data);
  },

  deleteContactUs(id: number) {
    return httpClient.delete(`${CONTACT_US_BASE}/${id}`);
  },
};

export default ContactUsService;

