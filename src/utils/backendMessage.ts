import i18n from "../i18n/i18n";

const humanizeMessageKey = (value: string) =>
  value
    .replace(/^[a-zA-Z0-9_-]+\./, "")
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const translateBackendMessage = (message: unknown, fallback = "") => {
  if (typeof message !== "string" || !message.trim()) return fallback;
  const [rawKey, ...detailParts] = message.split(":");
  const key = rawKey.trim();
  const detail = detailParts.join(":").trim();
  const translated = i18n.t(key);
  const text = translated === key ? humanizeMessageKey(key) : translated;
  return detail ? `${text}: ${detail}` : text;
};

export const translateBackendErrors = (errors: unknown, fallback = "") => {
  if (!Array.isArray(errors)) return fallback;
  return errors.map((error) => translateBackendMessage(error, ""))
    .filter(Boolean).join("\n") || fallback;
};
