import type { IUser } from "./user.interface";

// ✅ AuthContext interface
export interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  menus: IMenu[]; // ✅ add menus here
  login: (data: ILoginResponse) => void;
  logout: () => void;
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