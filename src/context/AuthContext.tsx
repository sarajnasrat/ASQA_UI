import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import type {
  IAuthContext,
  ILoginResponse,
  IMenu,
} from "../interface/auth.interface";
import type { IUser } from "../interface/user.interface";
import type { MenuItem } from "primereact/menuitem";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const getPermissionsFromToken = (token: string) => {
  const decoded: any = jwtDecode(token);

  return (
    decoded.roles
      ?.split(",")
      .map((permission: string) => permission.trim().toUpperCase())
      .filter(Boolean) ?? []
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<IUser | null>(null);
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [authReady, setAuthReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.clear();

    setUser(null);
    setMenus([]);
    setRoles([]);
    setPermissions([]);

    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedMenus = localStorage.getItem("menus");
    const storedRoles = localStorage.getItem("roles");
    const token = localStorage.getItem("accessToken");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedMenus) {
      setMenus(JSON.parse(storedMenus));
    }

    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    }

    if (token) {
      setPermissions(getPermissionsFromToken(token));
    }

    setAuthReady(true);
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };

    window.addEventListener("auth:force-logout", handleForceLogout);

    return () => {
      window.removeEventListener("auth:force-logout", handleForceLogout);
    };
  }, [logout]);

  const login = (data: ILoginResponse) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    const userData: IUser = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      active: data.active,
      profileImage: data.profileImage,
      roles: data.roles,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("menus", JSON.stringify(data.menus));
    localStorage.setItem(
      "committeeIds",
      JSON.stringify(data.committeeIds || []),
    );

    const roleNames =
      data.roles?.map((role: any) => role.name.trim().toUpperCase()) ?? [];

    localStorage.setItem("roles", JSON.stringify(roleNames));

    setUser(userData);
    setMenus(data.menus);
    setRoles(roleNames);
    setPermissions(getPermissionsFromToken(data.accessToken));
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const withPermission = (permission: string, item: MenuItem): MenuItem[] => {
    return hasPermission(permission) ? [item] : [];
  };

  const hasRole = (role: string) => {
    return roles.includes(role.trim().toUpperCase());
  };

  return (
    <AuthContext.Provider
      value={{
        roles,
        user,
        menus,
        permissions,
        hasRole,
        hasPermission,
        withPermission,
        isAuthenticated: !!user,
        login,
        logout,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
