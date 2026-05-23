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
  updateSerialNumber(id: number, serialNumber: string, file?: File) {
    const formData = new FormData();

    formData.append("serialNumber", serialNumber);

    if (file) {
      formData.append("file", file);
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
  updateCertificationStatus(id: number, status: string) {
  return httpClient.patch(`${CERTIFICATION_BASE}/${id}/status`, null, {
    params: { status },
  });
},
};

export default CertificationService;
