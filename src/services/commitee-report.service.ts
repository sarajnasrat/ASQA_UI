// services/commitee-report.service.ts
import httpClient from "../api/httpClient";

const BASE_URL = "/commiteereport";

export const CommiteeReportService = {
  // ================= GET ALL =================
  getAll() {
    return httpClient.get(`${BASE_URL}/all`);
  },

  // ================= PAGINATION =================
  getAllPaginated(params?: any) {
    return httpClient.get(`${BASE_URL}`, { params });
  },

  // ================= GET BY ID =================
  getById(id: number) {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // ================= CREATE =================
  create(data: any) {
    return httpClient.post(`${BASE_URL}`, data);
  },

  // ================= UPDATE =================
  update(id: number, data: any) {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },

  // ================= DELETE =================
  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  }
};

export default CommiteeReportService;