import httpClient from "../api/httpClient";

const USER_BASE = '/menus';

export const MenuService = {
  getAllMenus() {
    return httpClient.get(`${USER_BASE}/all`);
  },

  getPaginatedMenus(params:any) {
    return httpClient.get(`${USER_BASE}/paginated-menus`, { params });
  },
  registerMenu(data:any) {
    return httpClient.post(`${USER_BASE}/create`, data);
  },
  getMenu(id:any) {
    return httpClient.get(`${USER_BASE}/${id}`);
  },
  updateMenu(id:any, data:any) {
    return httpClient.put(`${USER_BASE}/${id}`, data);
  },
  deleteMenu(id:any) {
    return httpClient.delete(`${USER_BASE}/${id}`);
  },
};

export default MenuService;