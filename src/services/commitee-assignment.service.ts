// services/commitee-assignment.service.ts
import httpClient from "../api/httpClient";

const BASE_URL = "/commitee-assignment";

export const CommiteeAssignmentService = {
  // ================= GET ALL =================
  getAll() {
    return httpClient.get(`${BASE_URL}/all`);
  },

  // ================= PAGINATION =================
  getAllPaginated(params?: any) {
    return httpClient.get(`${BASE_URL}`, { params });
  },
getByCommitteeIds(committeeIds: number[], params?: any) {
  return httpClient.get(`${BASE_URL}/committee`, {
    params: {
      ...params,
      committeeIds,
    },
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();

      Object.keys(params).forEach(key => {
        const value = params[key];

        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      });

      return searchParams.toString();
    },
  });
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
patchUpdate(id: number, data: any, file?: File) {

  const formData = new FormData();

  // ✅ JSON DTO
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], {
      type: "application/json",
    })
  );

  // ✅ Optional file
  if (file) {
    formData.append("file", file);
  }

  return httpClient.patch(`${BASE_URL}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
},
  // ================= DELETE =================
  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  }
};

export default CommiteeAssignmentService;