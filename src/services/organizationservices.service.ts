import httpClient from "../api/httpClient";

const ORGANIZATION_SERVICES_BASE = "/organizations";

export const OrganizationServicesService = {
  getPaginatedOrganizations(params?: any) {
    return httpClient.get(`${ORGANIZATION_SERVICES_BASE}`, { params });
  },

  getAllOrganizations() {
    return httpClient.get(`${ORGANIZATION_SERVICES_BASE}/all`);
  },

  getOrganizationById(id: number) {
    return httpClient.get(`${ORGANIZATION_SERVICES_BASE}/${id}`);
  },

  createOrganization(data: any) {
    return httpClient.post(`${ORGANIZATION_SERVICES_BASE}`, data);
  },

  updateOrganization(id: number, data: any) {
    return httpClient.put(`${ORGANIZATION_SERVICES_BASE}/${id}`, data);
  },

  deleteOrganization(id: number) {
    return httpClient.delete(`${ORGANIZATION_SERVICES_BASE}/${id}`);
  },
};

export default OrganizationServicesService;
