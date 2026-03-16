// services/certificationRequest.service.ts
import httpClient from "../api/httpClient";

const BASE_URL = "/certificationrequest";

export const CertificationRequestService = {
  // ✅ Get all without pagination
  getAll() {
    return httpClient.get(`${BASE_URL}/all`);
  },

  // ✅ Get all with pagination
  getAllPaginated(params?: any) {
    return httpClient.get(`${BASE_URL}`, { params });
  },

  // ✅ Get by ID
  getById(id: number) {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // ✅ Create
  create(data: any) {
    return httpClient.post(`${BASE_URL}`, data);
  },

  // ✅ Update
  update(id: number, data: any) {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },

  // ✅ Delete
  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  },

  // ✅ PATCH - Update request status
  updateStatus(id: number, status: string) {
    return httpClient.patch(`${BASE_URL}/${id}/status`, null, {
      params: { status },
    });
  }
};

export default CertificationRequestService;