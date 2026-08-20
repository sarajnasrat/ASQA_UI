import httpClient from "../api/httpClient";

const CERTIFICATION_BASE = "/certifications";

const CertificationService = {
  // =============================
  // Get ALL Certifications
  // =============================
  getAllCertifications() {
    return httpClient.get(`${CERTIFICATION_BASE}/all`);
  },

  // =============================
  // Get PAGINATED Certifications
  // =============================
  getPaginatedCertifications(params: any) {
    return httpClient.get(`${CERTIFICATION_BASE}`, {
      params,
    });
  },

  // =============================
  // Get Certification By ID
  // =============================
  getCertificationById(id: number) {
    return httpClient.get(`${CERTIFICATION_BASE}/${id}`);
  },

  // =============================
  // Get Certification Details By Request ID
  // =============================
  getDetailsByRequestId(requestId: number) {
    return httpClient.get(`${CERTIFICATION_BASE}/request/${requestId}/details`);
  },

  // =============================
  // Delete Certification
  // =============================
  deleteCertification(id: number) {
    return httpClient.delete(`${CERTIFICATION_BASE}/${id}`);
  },
  updateSerialNumber(
    id: number,
    serialNumber: string,
    file?: File,
    status?: string,
  ) {
    const formData = new FormData();

    formData.append("serialNumber", serialNumber);

    if (file) {
      formData.append("file", file);
    }

    if (status) {
      formData.append("status", status);
    }

    return httpClient.patch(
      `${CERTIFICATION_BASE}/${id}/serial-number`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
  // =============================
  // Get PAGINATED Certifications By Status
  // =============================
  getPaginatedCertificationsByStatus(status: string, params: any) {
    return httpClient.get(`${CERTIFICATION_BASE}/status/${status}`, {
      params,
    });
  },
  getPaginatedCertificationsByType(
    certificationType: string,
    status: string | undefined,
    params: any,
  ) {
    return httpClient.get(`${CERTIFICATION_BASE}/type/${certificationType}`, {
      params: { ...params, ...(status ? { status } : {}) },
    });
  },
  verfyCertification(param: any) {
    return httpClient.get(`${CERTIFICATION_BASE}/search-by-certificate-number`, {
      params: { param },
    });
  },
  updateCertificationStatus(id: number, status: string, reason?: string) {
  return httpClient.patch(`${CERTIFICATION_BASE}/${id}/status`, null, {
    params: { status, ...(reason ? { reason } : {}) },
  });
  
},

  issueCertification(id: number) {
    return this.updateCertificationStatus(id, "CERTIFICATION_ISSUED");
  },

  startSupervision(id: number, reason: string, files: File[], durationMonths?: number) {
    const formData = new FormData();
    if (reason) formData.append("reason", reason);
    if (durationMonths) formData.append("durationMonths", String(durationMonths));
    files.forEach((file) => formData.append("files", file));
    return httpClient.post(`${CERTIFICATION_BASE}/${id}/supervision`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

};

export default CertificationService;
