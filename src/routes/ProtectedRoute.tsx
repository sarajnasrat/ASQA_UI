// ProtectedRoute.tsx - Make sure this is correct
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const normalizePath = (path: string) => {
  const trimmed = path.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}`.toLowerCase() : "/";
};

interface RouteMenu {
  type?: unknown;
  path?: unknown;
  permissionName?: unknown;
  children?: unknown;
}

const flattenMenus = (items: unknown[]): RouteMenu[] =>
  items.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const menu = value as RouteMenu;
    return [menu, ...(Array.isArray(menu.children) ? flattenMenus(menu.children) : [])];
  });

const menuPathMatches = (pathname: string, configuredPath: string) => {
  const currentParts = normalizePath(pathname).split("/").filter(Boolean);
  const configuredParts = normalizePath(configuredPath).split("/").filter(Boolean);
  if (configuredParts.length > currentParts.length) return false;

  return configuredParts.every((part, index) =>
    part.startsWith(":") || part === "*" || part === currentParts[index],
  );
};

const findMatchingMenu = (pathname: string, items: unknown[]) =>
  flattenMenus(items)
    .filter((menu) => {
      if (menu.type === "GROUP") return false;
      if (typeof menu.path !== "string" || !menu.path.trim()) return false;
      return menuPathMatches(pathname, menu.path);
    })
    .sort((left, right) =>
      normalizePath(String(right.path)).length - normalizePath(String(left.path)).length,
    )[0];

const getRoutePermission = (pathname: string) => {
  const pathSegments = normalizePath(pathname).split("/").filter(Boolean);
  if (
    pathSegments.length === 3 &&
    menuPathMatches(pathname, "/commitee-assignment/view/:id")
  ) {
    return "VIEW_COMMITEEASSIGNMENT";
  }
  return undefined;
};

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
}) => {
  const token = localStorage.getItem("accessToken");
  const { hasPermission, menus, routeMenus, routeMenusReady, authReady } = useAuth();
  const location = useLocation();

  // no token → login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!authReady) {
    return <div>Loading...</div>; // or spinner
  }
  if (!routeMenusReady) {
    return <div>Loading...</div>;
  }
  const currentPath = normalizePath(location.pathname);
  if (currentPath === "/unauthorized") return <>{children}</>;

  const routeMenu = findMatchingMenu(currentPath, routeMenus);
  const routePermission = (permission ||
    getRoutePermission(currentPath) ||
    (typeof routeMenu?.permissionName === "string" ? routeMenu.permissionName : undefined))
      ?.trim()
      .toUpperCase();
  if (routePermission && !hasPermission(routePermission)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  // Sidebar menus control visibility. Route access comes from the matching
  // menu definition's permission, including menus hidden from this user's sidebar.
  const sidebarMenu = findMatchingMenu(currentPath, menus);
  const isAuthorized = Boolean(routePermission) || Boolean(sidebarMenu);

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
