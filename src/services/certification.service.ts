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
  // Delete Certification
  // =============================
  deleteCertification(id: number) {
    return httpClient.delete(`${CERTIFICATION_BASE}/${id}`);
  },

};

export default CertificationService;