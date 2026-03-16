// src/hooks/handleApi.ts
export const handleApi = async <T>(
  apiCall: () => Promise<T>,
  showSuccess: (summary: string, detail?: string) => void,
  showError: (summary: string, detail?: string) => void,
  t?: (key: string) => string // optional i18n translator
): Promise<T | null> => {
  try {
    const response = await apiCall();
    const resData: any = (response as any).data;

    // Handle error responses
    if (resData?.statusCode >= 400 || resData?.success === false) {
      const backendErrors: string[] = resData?.errors || [];
      const message =
        backendErrors.length > 0
          ? backendErrors.map(e => (t ? t(e) : e)).join(", ")
          : resData?.message || (t ? t("common.somethingWentWrong") : "Something went wrong");
      showError(t ? t("common.error") : "Error", message);
      return null;
    }

    // Handle success responses
    if (resData?.success === true || resData?.statusCode < 400) {
      const message = resData?.successMessage
        ? t
          ? t(resData.successMessage)
          : resData.successMessage
        : t
        ? t("common.success")
        : "Success";

      showSuccess(t ? t("common.success") : "Success", message);
    }

    return response;
  } catch (error: any) {
    const backendErrors: string[] = error?.response?.data?.errors || [];
    const message =
      backendErrors.length > 0
        ? backendErrors.map(e => (t ? t(e) : e)).join(", ")
        : error?.response?.data?.message || (t ? t("common.somethingWentWrong") : "Something went wrong");
    showError(t ? t("common.error") : "Error", message);
    return null;
  }
};