import httpClient from "../api/httpClient";

const USER_BASE = '/roles';

export const RoleService = {
  getAllRoles() {
    return httpClient.get(`${USER_BASE}/all-roles`);
  },

  getPaginatedRoles(params:any) {
    return httpClient.get(`${USER_BASE}/paginated-roles`, { params });
  },
  registerRole(data:any) {
    return httpClient.post(`${USER_BASE}/create-role`, data);
  },
  getRole(id:any) {
    return httpClient.get(`${USER_BASE}/get-role/${id}`);
  },
  updateRole(id:any, data:any) {
    return httpClient.put(`${USER_BASE}/update-role/${id}`, data);
  },
  deleteRole(id:any) {
    return httpClient.delete(`${USER_BASE}/delete-role/${id}`);
  },
};

export default RoleService;