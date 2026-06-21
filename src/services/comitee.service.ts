// services/commitee.service.ts
import httpClient from "../api/httpClient";

const BASE_URL = "/commitee";

export interface CommitteeAttachment {
  id: number;
  attachmentName: string;
  file: string;
  fileType?: string | null;
  fileSize?: number | null;
  attachmentReferenceType?: string | null;
  committeeId?: number | null;
  paymentId?: number | null;
}

export interface CommitteeResponse {
  id: number;
  name: string;
  description: string;
  committeeType: string;
  createdDate: string;
  active: boolean;
  memberCount: number;
  members?: any[];
  assignments?: any[];
  attachments?: CommitteeAttachment[];
}

const buildCommitteeFormData = (data: any, file?: File | null) => {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(data)], {
      type: "application/json",
    }),
  );

  formData.append("name", data.name ?? "");
  formData.append("description", data.description ?? "");
  formData.append("committeeType", data.committeeType ?? "");
  formData.append("active", String(data.active ?? true));

  if (file instanceof File) {
    formData.append("file", file);
    formData.append("attachment", file);
    formData.append("committeeAttachment", file);
  }

  return formData;
};

export const CommiteeService = {
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
  create(data: any, file?: File | null) {
    return httpClient.post(`${BASE_URL}`, buildCommitteeFormData(data, file), {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ================= UPDATE =================
  update(id: number, data: any, file?: File | null) {
    return httpClient.put(`${BASE_URL}/${id}`, buildCommitteeFormData(data, file), {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ================= DELETE =================
  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  }
};

export default CommiteeService;
