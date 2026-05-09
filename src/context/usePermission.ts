import { useAuth } from "./AuthContext";

/**
 * Check single permission
 */
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
};

/**
 * Check ANY permission
 */
export const useAnyPermission = (permissions: string[]): boolean => {
  const { permissions: userPermissions } = useAuth();

  return permissions.some(p =>
    userPermissions.includes(p)
  );
};

/**
 * Check ALL permissions
 */
export const useAllPermissions = (permissions: string[]): boolean => {
  const { permissions: userPermissions } = useAuth();

  return permissions.every(p =>
    userPermissions.includes(p)
  );
};