// src/context/ToastContext.tsx
import React, { createContext, useRef, useContext, type ReactNode } from "react";
import { Toast } from "primereact/toast";

interface ToastContextProps {
  showSuccess: (summary: string, detail?: string) => void;
  showError: (summary: string, detail?: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastRef = useRef<Toast>(null);

  const showSuccess = (summary: string, detail?: string) => {
    toastRef.current?.show({ severity: "success", summary, detail, life: 3000 });
  };

  const showError = (summary: string, detail?: string) => {
    toastRef.current?.show({ severity: "error", summary, detail, life: 4000 });
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};