import { useRef } from "react";
import { Toast } from "primereact/toast";

export const useAppToast = () => {
  const toast = useRef<Toast>(null);

  const showToast = (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string,
    life: number = 3000
  ) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life,
    });
  };

  return { toast, showToast };
};
