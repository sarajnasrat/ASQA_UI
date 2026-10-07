import httpClient from "../api/httpClient";
import type { IMenu } from "../interface/auth.interface";

const USER_BASE = '/menus';

type MenuNode = IMenu;

// Flat options are needed by the parent dropdown and role menu selectors.
const flattenMenus = (tree: MenuNode[]): MenuNode[] => {
  const result: MenuNode[] = [];
  const visited = new Set<number>();
  const visit = (nodes: MenuNode[], parentId: number | null = null) => {
    for (const node of nodes) {
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      result.push({ ...node, parentId: node.parentId ?? parentId, children: [] });
      visit(node.children || [], node.id);
    }
  };
  visit(tree);
  return result;
};

export const MenuService = {
  getSidebar() {
    return httpClient.get(`${USER_BASE}/sidebar`);
  },
  getMenuTree() {
    return httpClient.get<IMenu[]>(`${USER_BASE}/all`);
  },

  async getAllMenus() {
    const response = await this.getMenuTree();
    return { ...response, data: flattenMenus(response.data) };
  },

  getPaginatedMenus(params:any) {
    return httpClient.get(`${USER_BASE}/paginated-menus`, { params });
  },
  searchMenus(params:any) {
    return httpClient.get(`${USER_BASE}/search`, { params });
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
