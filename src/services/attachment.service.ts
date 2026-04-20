import httpClient from "../api/httpClient";

const BASE_URL = "/attachment";

export const AttachmentService = {

  getAll() {
    return httpClient.get(`${BASE_URL}/all`);
  },
    getPaginatedAttachments(params: any) {
    return httpClient.get(`${BASE_URL}/paginated-attachments`, { params });
  },

  getById(id: number) {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // ✅ generic fetch
  getByReference(referenceId: number, referenceType: string) {
    return httpClient.get(
      `${BASE_URL}/reference/${referenceType}/${referenceId}`
    );
  },

  // ✅ create attachment
  create(
    file: File,
    attachmentName: string,
    referenceId: number,
    referenceType: string
  ) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("attachmentName", attachmentName);
    formData.append("referenceId", referenceId.toString());
    formData.append("referenceType", referenceType);

    return httpClient.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  }
};

export default AttachmentService;