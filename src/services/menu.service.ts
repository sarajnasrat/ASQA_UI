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
    return httpClient.get(`${USER_BASE}/get-menu/${id}`);
  },
  updateMenu(id:any, data:any) {
    return httpClient.put(`${USER_BASE}/update-menu/${id}`, data);
  },
  deleteMenu(id:any) {
    return httpClient.delete(`${USER_BASE}/delete-menu/${id}`);
  },
};

export default MenuService;