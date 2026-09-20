const configuredApiBase = import.meta.env.VITE_API_BASE_URL;

export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  configuredApiBase?.replace(/\/api\/?$/, "") ||
  (import.meta.env.DEV ? "http://localhost:8080" : window.location.origin);

export const API_BASE_URL = configuredApiBase || `${API_ORIGIN}/api`;

export function toApiUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
