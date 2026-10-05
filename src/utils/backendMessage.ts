import i18n from "../i18n/i18n";

const backendMessageAliases: Record<string, string> = {
  "Invalid language code": "country.errors.invalidLanguageCode",
  "No company was found for the provided Jawaz number.":
    "registration.backend.noCompanyForJawaz",
  "Your company already has a certification request in progress. A new company request can be created only after the previous request is issued.":
    "registration.backend.activeRequestExists",
  "Your company already has a certification request in progress. A new request can be created only after the previous request is issued.":
    "registration.backend.activeRequestExists",
  "Your company is blacklisted and cannot create a certification request.":
    "registration.backend.companyBlacklisted",
  "Your company is suspended and cannot create a certification request.":
    "registration.backend.companySuspended",
  "Your company is under review. It must be whitelisted before creating a certification request.":
    "registration.backend.companyUnderReview",
  "Your company is on the watchlist. It must be whitelisted before creating a certification request.":
    "registration.backend.companyOnWatchlist",
  "Your company has not been reviewed. It must be whitelisted before creating a certification request.":
    "registration.backend.companyNotWhitelisted",
};

const humanizeMessageKey = (value: string) =>
  value
    .replace(/^[a-zA-Z0-9_-]+\./, "")
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const translateBackendMessage = (
  message: unknown,
  fallback = "",
  translate: (key: string) => string = (key) => i18n.t(key),
) => {
  if (typeof message !== "string" || !message.trim()) return fallback;
  const [rawKey, ...detailParts] = message.split(":");
  const raw = rawKey.trim();
  const isCountryErrorKey = /^(country\.(code|translations|translation|language|name)\.)/.test(raw);
  const key = backendMessageAliases[raw] || (isCountryErrorKey ? `country.errors.${raw.slice("country.".length)}` : raw);
  const detail = detailParts.join(":").trim();
  const translated = translate(key);
  const text = translated === key
    ? backendMessageAliases[raw]
      ? raw
      : humanizeMessageKey(raw)
    : translated;
  return detail ? `${text}: ${detail}` : text;
};

export const translateBackendErrors = (errors: unknown, fallback = "") => {
  if (!Array.isArray(errors)) return fallback;
  return errors.map((error) => translateBackendMessage(error, "", (key) => i18n.t(key)))
    .filter(Boolean).join("\n") || fallback;
};
