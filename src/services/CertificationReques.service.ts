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
getAllPaginatedByStatus(
  status: string,
  page: number = 0,
  size: number = 10,
  sort: string = 'id,desc'
) {
  return httpClient.get(`${BASE_URL}/get-all`, {
    params: {
      status: status,
      page: page,
      size: size,
      sort: sort,
    },
  });
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
updateStatus(id: number, formData: FormData) {
  return httpClient.patch(
    `${BASE_URL}/${id}/status`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
},

standardProvided(id: number, formData: FormData) {
  return httpClient.patch(
    `${BASE_URL}/${id}/status`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
},
assignCommittee(requestId: number, committeeId: number) {
  return httpClient.post(
    `${BASE_URL}/${requestId}/assign-committee`,
    null,
    {
      params: {
        committeeId,
      },
    }
  );
},
setDeadline(requestId: number, startDate: string, endDate: string) {
  return httpClient.patch(
    `${BASE_URL}/${requestId}/assign-deadline`,
    {
      startDate,
      endDate,
    }
  );
},
};

export default CertificationRequestService;