// src/hooks/handleApi.ts
import { translateBackendMessage } from "../utils/backendMessage";
import i18n from "../i18n/i18n";

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
      const backendErrors: string[] = [
        ...(Array.isArray(resData?.errors) ? resData.errors : []),
        ...(Array.isArray(resData?.validationErrors)
          ? resData.validationErrors.map(
              (validationError: any) =>
                validationError?.code || validationError?.message,
            )
          : []),
      ].filter((message): message is string => typeof message === "string");
      const message =
        backendErrors.length > 0
          ? backendErrors
              .map((error) =>
                translateBackendMessage(
                  error,
                  "",
                  (key) => i18n.t(key),
                ),
              )
              .join(", ")
          : resData?.message
            ? translateBackendMessage(
                resData.message,
                resData.message,
                (key) => i18n.t(key),
              )
            : t
              ? t("common.somethingWentWrong")
              : "Something went wrong";
      showError(t ? t("common.error") : "Error", message);
      return null;
    }

    // Handle success responses
    if (resData?.success === true || resData?.statusCode < 400) {
      const message = resData?.successMessage
        ? translateBackendMessage(
            resData.successMessage,
            resData.successMessage,
            (key) => i18n.t(key),
          )
        : t
        ? t("common.success")
        : "Success";

      showSuccess(t ? t("common.success") : "Success", message);
    }

    return response;
  } catch (error: any) {
    const responseData = error?.response?.data;
    const backendErrors: string[] = [
      ...(Array.isArray(responseData?.errors) ? responseData.errors : []),
      ...(Array.isArray(responseData?.validationErrors)
        ? responseData.validationErrors.map(
            (validationError: any) =>
              validationError?.code || validationError?.message,
          )
        : []),
    ].filter((message): message is string => typeof message === "string");
    const message =
      backendErrors.length > 0
        ? backendErrors
            .map((backendError) =>
              translateBackendMessage(
                backendError,
                "",
                (key) => i18n.t(key),
              ),
            )
            .join(", ")
        : responseData?.message
          ? translateBackendMessage(
              responseData.message,
              responseData.message,
              (key) => i18n.t(key),
            )
          : t
            ? t("common.somethingWentWrong")
            : "Something went wrong";
    showError(t ? t("common.error") : "Error", message);
    return null;
  }
};
