import httpClient from "../api/httpClient";

const ORGANIZATION_INFO_BASE = "/organization-info";

const OrganizationInfoService = {
  getPaginatedOrganizationInfo: (params: any) =>
    httpClient.get(`${ORGANIZATION_INFO_BASE}`, { params }),

  getAllOrganizationInfo: () => httpClient.get(`${ORGANIZATION_INFO_BASE}/all`),

  getOrganizationInfoById: (id: number) =>
    httpClient.get(`${ORGANIZATION_INFO_BASE}/${id}`),

  createOrganizationInfo: (payload: any) =>
    httpClient.post(`${ORGANIZATION_INFO_BASE}`, payload),

  updateOrganizationInfo: (id: number, payload: any) =>
    httpClient.put(`${ORGANIZATION_INFO_BASE}/${id}`, payload),

  deleteOrganizationInfo: (id: number) =>
    httpClient.delete(`${ORGANIZATION_INFO_BASE}/${id}`),
};

export default OrganizationInfoService;
