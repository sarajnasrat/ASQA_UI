import httpClient from "../api/httpClient";

const BASE_URL = "/attachment";

export const AttachmentService = {

  // ✅ Get all attachments
  getAll() {
    return httpClient.get(`${BASE_URL}/all`);
  },

  // ✅ Get attachment by ID
  getById(id: number) {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // ✅ Get attachments by company
  getByCompany(companyId: number) {
    return httpClient.get(`${BASE_URL}/company/${companyId}`);
  },

  // ✅ Create attachment (multipart)
  create(file: File, attachmentName: string, companyId: number) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("attachmentName", attachmentName);
    formData.append("companyId", companyId.toString());

    return httpClient.post(`${BASE_URL}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  // ✅ Update attachment (file optional)
  update(id: number, file: File | null, attachmentName: string, companyId: number) {
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    }

    formData.append("attachmentName", attachmentName);
    formData.append("companyId", companyId.toString());

    return httpClient.put(`${BASE_URL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  // ✅ Delete attachment
  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  }

};

export default AttachmentService;