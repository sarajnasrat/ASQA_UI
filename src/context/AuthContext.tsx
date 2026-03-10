import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IAuthContext, ILoginResponse, IMenu } from "../interface/auth.interface";
import type { IUser } from "../interface/user.interface";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [menus, setMenus] = useState<IMenu[]>([]); // ✅ menus state

  // ✅ Load user and menus from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedMenus = localStorage.getItem("menus");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedMenus) {
      setMenus(JSON.parse(storedMenus));
    }
  }, []);

  // ✅ login method
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
    localStorage.setItem("menus", JSON.stringify(data.menus)); // ✅ store menus

    setUser(userData);
    setMenus(data.menus); // ✅ set menus in state
  };

  // ✅ logout method
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setMenus([]);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        menus,      // ✅ provide menus in context
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ useAuth hook
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};