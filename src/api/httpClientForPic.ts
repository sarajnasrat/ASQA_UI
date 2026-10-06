import { refreshSession } from "./sessionRefresh";
import axios, { type AxiosRequestConfig } from "axios";
import i18n from "../i18n/i18n";
import { API_ORIGIN } from "../config/api";

let isRefreshing = false;

let failedQueue: {
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token as string);
  });
  failedQueue = [];
};

const httpClientForPic = axios.create({
  baseURL: API_ORIGIN,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const forceLogout = () => {
  window.dispatchEvent(new Event("auth:force-logout"));
};



// 🔹 Request Interceptor
httpClientForPic.interceptors.request.use((config) => {
  // 🚫 Skip token if skipAuth is true
  if (!config.headers?.skipAuth) {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Remove skipAuth so backend does not receive it
  if (config.headers?.skipAuth) {
    delete config.headers.skipAuth;
  }

  // 🌍 Language header
  const lang = i18n.language || "en";
  config.headers["Accept-Language"] = lang;

  return config;
});


// 🔹 Response Interceptor
httpClientForPic.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) return Promise.reject(error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/users/refresh-token"
    ) {
      if (isRefreshing) {
        originalRequest._retry = true;
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return httpClientForPic(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshSession();

        localStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return httpClientForPic(originalRequest);
      } catch (err) {
        processQueue(err, null);
        if (axios.isAxiosError(err) && [401, 403, 404].includes(err.response?.status || 0)) {
          forceLogout();
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default httpClientForPic;
