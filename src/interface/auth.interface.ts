import type { MenuItem } from "primereact/menuitem";
import type { IUser } from "./user.interface";

// ✅ AuthContext interface
export interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  authReady: boolean; // ✅ NEW: indicates if auth state is initialized
  menus: IMenu[]; // ✅ add menus here
  routeMenus: IMenu[];
  routeMenusReady: boolean;
  permissions: string[]; // ✅ NEW
  hasPermission: (p: string) => boolean; // ✅ NEW
  login: (data: ILoginResponse) => void;
  logout: () => void;
  refreshMenus: () => Promise<void>;
  withPermission: (permission: string, item: MenuItem) => MenuItem[];
  roles: string[];
  hasRole: (role: string) => boolean;
}

// ✅ Login API response interface
export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  profileImage?: string;
  roles: string[];
  committeeIds?: number[]; // ✅ include committee IDs in login response
  menus: IMenu[]; // ✅ include menus in login response
}

// ✅ Menu interface
export interface IMenu {
  id: number;
  name: string;
  type?: "GROUP" | "ROUTE";
  path: string | null;
  icon?: string;
  parentId?: number | null;
  children?: IMenu[];
  roleIds?: number[];
  labelEn?: string;
  labelDr?: string;
  labelPs?: string;
  permissionId?: number | null;
  permissionName?: string | null;
}
