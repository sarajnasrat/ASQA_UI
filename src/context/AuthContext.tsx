import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import type { IAuthContext, ILoginResponse, IMenu } from "../interface/auth.interface";
import type { IUser } from "../interface/user.interface";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const navigate = useNavigate();

  const [user, setUser] = useState<IUser | null>(null);
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]); // ✅ NEW
  const [authReady, setAuthReady] = useState(false); // ✅ to track if auth state is initialized

  // ===============================
  // Load from localStorage
  // ===============================
  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const storedMenus = localStorage.getItem("menus");
    const token = localStorage.getItem("accessToken");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedMenus) {
      setMenus(JSON.parse(storedMenus));
    }

    // ✅ extract permissions from JWT
    if (token) {
      const decoded: any = jwtDecode(token);


  const perms =
  decoded.roles
    ?.split(",")
    .map((p: string) => p.trim().toUpperCase())
    .filter(Boolean) ?? [];

      setPermissions(perms);

    }
    setAuthReady(true); // ✅ mark auth as ready after loading

  }, []);
          console.log("AuthContext initialized with user:", permissions);

  // ===============================
  // LOGIN
  // ===============================
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
      JSON.stringify(data.committeeIds || [])
    );

    // ✅ decode permissions immediately
    const decoded: any = jwtDecode(data.accessToken);

    const perms =
      decoded.roles?.split(",") ?? [];

    setPermissions(perms);

    setUser(userData);
    setMenus(data.menus);
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setMenus([]);
    setPermissions([]);
    navigate("/login");
  };

  // ===============================
  // Permission Checker
  // ===============================
const hasPermission = (permission: string) => {
  console.log(
    "Checking permission:",
    permission,
    "against user permissions:",
    permissions
  );

  return permissions.includes(permission);
};

  return (
    <AuthContext.Provider
      value={{
        user,
        menus,
        permissions,       // ✅ expose permissions
        hasPermission,     // ✅ expose checker
        isAuthenticated: !!user,
        login,
        logout,
        authReady
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===============================
// Hook
// ===============================
export const useAuth = (): IAuthContext => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};