import axios from "axios";
import { API_BASE_URL } from "../config/api";

let pendingRefresh: Promise<string> | null = null;

/** Share cookie-based refresh between API and image requests. */
export const refreshSession = (): Promise<string> => {
  if (!pendingRefresh) {
    pendingRefresh = axios.post(`${API_BASE_URL}/users/refresh-token`, null, {
      withCredentials: true,
      timeout: 15000,
    }).then((response) => {
      const token = response.data?.data?.accessToken;
      if (typeof token !== "string" || !token) throw new Error("No access token returned");
      localStorage.setItem("accessToken", token);
      window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: token }));
      return token;
    }).finally(() => { pendingRefresh = null; });
  }
  return pendingRefresh;
};
