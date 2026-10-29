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
import MenuService from "../services/menu.service";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const getPermissionsFromToken = (token: string) => {
  const decoded: any = jwtDecode(token);
  const claims = [decoded.permissions, decoded.authorities, decoded.roles]
    .flatMap((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return value.split(",");
      return [];
    })
    .map((value) => {
      if (typeof value === "string") return value;
      if (value && typeof value === "object") {
        return value.authority ?? value.permissionName ?? value.name ?? "";
      }
      return "";
    })
    .map((permission) => String(permission).trim().toUpperCase())
    .filter(Boolean);

  return [...new Set(claims)];
};

const canonicalPermission = (permission: string) => {
  const normalized = permission.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  const [action, ...resourceParts] = normalized.split("_");
  const resource = resourceParts.join("_").replace(/S$/, "");
  const canonicalAction = action === "EDIT" ? "UPDATE" : action === "CREATE" ? "ADD" : action;
  return `${canonicalAction}_${resource}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<IUser | null>(null);
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [routeMenus, setRouteMenus] = useState<IMenu[]>([]);
  const [routeMenusReady, setRouteMenusReady] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [authReady, setAuthReady] = useState(false);

  const refreshMenus = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) return;
    const response = await MenuService.getSidebar();
    if (!Array.isArray(response.data)) throw new Error("Invalid sidebar response");
    if (!localStorage.getItem("accessToken")) return;
    setMenus(response.data);
    localStorage.setItem("menus", JSON.stringify(response.data));
  }, []);

  const refreshRouteMenus = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) return;
    const response = await MenuService.getAllMenus();
    if (!Array.isArray(response.data)) throw new Error("Invalid route menu response");
    if (!localStorage.getItem("accessToken")) return;
    setRouteMenus(response.data);
    localStorage.setItem("routeMenus", JSON.stringify(response.data));
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();

    setUser(null);
    setMenus([]);
    setRouteMenus([]);
    setRoles([]);
    setPermissions([]);

    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedMenus = localStorage.getItem("menus");
    const storedRouteMenus = localStorage.getItem("routeMenus");
    const storedRoles = localStorage.getItem("roles");
    const token = localStorage.getItem("accessToken");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedMenus) {
      setMenus(JSON.parse(storedMenus));
    }

    if (storedRouteMenus) {
      setRouteMenus(JSON.parse(storedRouteMenus));
    }

    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    }

    if (token) {
      setPermissions(getPermissionsFromToken(token));
      void refreshMenus().catch(() => { /* Keep cached navigation until the next refresh. */ });
      void refreshRouteMenus()
        .catch(() => { /* Keep cached route metadata if the catalog is unavailable. */ })
        .finally(() => setRouteMenusReady(true));
    } else {
      setRouteMenusReady(true);
    }

    setAuthReady(true);
  }, [refreshMenus, refreshRouteMenus]);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };

    const handleTokenRefreshed = (event: Event) => {
      setPermissions(getPermissionsFromToken((event as CustomEvent<string>).detail));
      void refreshMenus().catch(() => { /* A subsequent refresh will retry. */ });
      void refreshRouteMenus().catch(() => { /* Keep cached route metadata until the next refresh. */ });
    };
    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    window.addEventListener("auth:force-logout", handleForceLogout);

    return () => {
      window.removeEventListener("auth:force-logout", handleForceLogout);
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
    };
  }, [logout, refreshMenus, refreshRouteMenus]);

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
    localStorage.setItem("routeMenus", JSON.stringify(data.menus));
    localStorage.setItem(
      "committeeIds",
      JSON.stringify(data.committeeIds || []),
    );

    const roleNames =
      data.roles?.map((role: any) => role.name.trim().toUpperCase()) ?? [];

    localStorage.setItem("roles", JSON.stringify(roleNames));

    setUser(userData);
    setMenus(data.menus);
    setRouteMenus(data.menus);
    setRouteMenusReady(false);
    setRoles(roleNames);
    setPermissions(getPermissionsFromToken(data.accessToken));
    void refreshRouteMenus()
      .catch(() => { /* Fall back to the menu catalog returned by login. */ })
      .finally(() => setRouteMenusReady(true));
  };

  const hasPermission = (permission: string) => {
    const normalizedPermission = permission.trim().toUpperCase();
    const equivalentPermissions: Record<string, string[]> = {
      VIEW_COUNTRY: ["VIEW_COUNTRY", "VIEW_COUNTRIES"],
      VIEW_PROVINCE: ["VIEW_PROVINCE", "VIEW_PROVINCES"],
      VIEW_DISTRICT: ["VIEW_DISTRICT", "VIEW_DISTRICTS"],
      UPDATE_COMPANY: [
        "UPDATE_COMPANY",
        "UPDATE_COMPANIES",
        "EDIT_COMPANY",
        "EDIT_COMPANIES",
        "COMPANY_UPDATE",
      ],
      VIEW_PAYMENT: ["VIEW_PAYMENT", "VIEW_PAYMENTPRICE", "VIEW_PAYMENTPRICES"],
      ADD_PAYMENT: ["ADD_PAYMENT", "ADD_PAYMENTPRICE", "ADD_PAYMENTPRICES"],
      UPDATE_PAYMENT: ["UPDATE_PAYMENT", "UPDATE_PAYMENTPRICE", "UPDATE_PAYMENTPRICES"],
      DELETE_PAYMENT: ["DELETE_PAYMENT", "DELETE_PAYMENTPRICE", "DELETE_PAYMENTPRICES"],
    };
    const acceptedPermissions = equivalentPermissions[normalizedPermission] || [normalizedPermission];
    const acceptedCanonicalPermissions = acceptedPermissions.map(canonicalPermission);
    if (permissions.some((value) => acceptedCanonicalPermissions.includes(canonicalPermission(value)))) {
      return true;
    }

    const menuPermissions = [
      ...menus,
      ...routeMenus,
    ].flatMap((menu: any) => {
      const collect = (item: any): string[] => {
        if (!item || typeof item !== "object") return [];
        return [
          typeof item.permissionName === "string" ? item.permissionName : "",
          ...(Array.isArray(item.children)
            ? item.children.flatMap(collect)
            : []),
        ];
      };
      return collect(menu);
    });

    return menuPermissions.some((value) =>
      acceptedCanonicalPermissions.includes(canonicalPermission(value)),
    );
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
        routeMenus,
        routeMenusReady,
        permissions,
        hasRole,
        hasPermission,
        withPermission,
        isAuthenticated: !!user,
        login,
        logout,
        refreshMenus,
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
