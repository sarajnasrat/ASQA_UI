import httpClient from "../api/httpClient";

const USER_BASE = '/permissions';

export const PermissionService = {
  getAllPermissions() {
    return httpClient.get(`${USER_BASE}/all`);
  },

  getPaginatedPermissions(params:any) {
    return httpClient.get(`${USER_BASE}/paginated`, { params });
  },
  registerPermission(data:any) {
    return httpClient.post(`${USER_BASE}/create`, data);
  },
  getPermission(id:any) {
    return httpClient.get(`${USER_BASE}/${id}`);
  },
  updatePermission(id:any, data:any) {
    return httpClient.put(`${USER_BASE}/update/${id}`, data);
  },
  deletePermission(id:any) {
    return httpClient.delete(`${USER_BASE}/delete/${id}`);
  },
};

export default PermissionService;