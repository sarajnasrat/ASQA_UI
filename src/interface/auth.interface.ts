import type { MenuItem } from "primereact/menuitem";
import type { IUser } from "./user.interface";

// ✅ AuthContext interface
export interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  authReady: boolean; // ✅ NEW: indicates if auth state is initialized
  menus: IMenu[]; // ✅ add menus here
  permissions: string[]; // ✅ NEW
  hasPermission: (p: string) => boolean; // ✅ NEW
  login: (data: ILoginResponse) => void;
  logout: () => void;
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
  path: string;
  icon?: string;
  parentId?: number | null;
  children?: IMenu[];
}
