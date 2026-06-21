import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  LoaderCircle,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import httpClient from "../../../api/httpClient";
import { handleApi } from "../../../hooks/handleApi";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

interface CertificationLookupResponse {
  certificateNumber: string;
  certificationType: string;
  issueDate: string;
  expiryDate: string;
  companyName: string;
}

export const CertificationVerification: React.FC = () => {
  const { t } = useTranslation();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<CertificationLookupResponse | null>(null);

  const formatDate = (value?: string) => {
    if (!value) return t("certificationVerification.notSpecified");
    return IslamicDateFormatter.formatQamari(value, true);
  };

  const typeLabel = (value?: string) => {
    if (!value) return t("certificationVerification.notSpecified");
    const key = `certificationVerification.certificationTypeOptions.${value}`;
    const translated = t(key);
    return translated === key
      ? value
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : translated;
  };

  const isExpired = useMemo(() => {
    if (!result?.expiryDate) return false;
    return new Date(result.expiryDate).getTime() < Date.now();
  }, [result]);

  const isValid = useMemo(() => !!result && !isExpired, [result, isExpired]);

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();

    const trimmedNumber = certificateNumber.trim();
    if (!trimmedNumber) {
      setSearched(true);
      setResult(null);
      setErrorMessage(
        t("certificationVerification.errorMessages.serialNumberRequired") ||
          "Please enter a certificate number.",
      );
      return;
    }

    setLoading(true);
    setSearched(false);
    setErrorMessage("");
    setResult(null);

    const response = await handleApi(
      () =>
        httpClient.get("/certifications/search-by-certificate-number", {
          params: { certificateNumber: trimmedNumber },
        }),
      () => {},
      (summary: string, detail?: string) => {
        setErrorMessage(
          detail ||
            summary ||
            t("certificationVerification.errorMessages.noData") ||
            "Certificate not found.",
        );
      },
      t,
    );

    setLoading(false);
    setSearched(true);

    if (response?.data?.data) {
      setResult(response.data.data);
      setErrorMessage("");
      return;
    }

    setResult(null);
    if (!errorMessage) {
      setErrorMessage(
        t("certificationVerification.errorMessages.noData") ||
          "Certificate not found.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pt-24">
      {/* Header Section - Matching CertificationDetails style */}
      <div className="relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-white opacity-5 rounded-full"></div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
              <ShieldCheck className="h-4 w-4 text-blue-200" />
              <span className="text-sm font-medium">
                {t("certificationVerification.verificationBadge") || "Secure Verification"}
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-linear-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                {t("certificationVerification.title") || "Certificate Verification"}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("certificationVerification.subtitle") ||
                "Verify a certificate by entering its certificate number and view the issued company, certification type, and validity dates."}
            </p>

            {/* Search bar - Fixed */}
            <div className="relative max-w-2xl mx-auto px-4 mb-10">
              <form
                onSubmit={handleSearch}
                className="flex flex-col items-stretch gap-4 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t("certificationVerification.certificateNumberPlaceholder")}
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-700 bg-transparent focus:outline-none text-base sm:text-lg rounded-xl"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !certificateNumber.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("common.searching")}
                    </span>
                  ) : (
                    t("common.search")
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto"
          >
            <path
              fill="#f9fafb"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[60vh]">
        {loading ? (
          // Loading State
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>

              {/* Spinner with gradient */}
              <div className="relative">
                <div className="animate-spin rounded-full h-24 w-24 border-[3px] border-gray-100 border-t-blue-600 border-r-blue-400 shadow-lg"></div>
                <FileSearch className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-blue-600" />
              </div>
            </div>

            {/* Animated text */}
            <div className="mt-8 space-y-2 text-center">
              <p className="text-gray-700 text-lg font-medium">
                {t("certification.searchingMessage") || "Searching for certificate..."}
              </p>
              <p className="text-gray-400 text-sm animate-pulse">
                {t("certification.pleaseWait") || "Please wait"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Result Section */}
            {searched && result && (
              <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
                {/* Enhanced Result Header */}
                <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">
                          {t("certificationVerification.certificateNumber")}
                        </p>
                        <p className="text-gray-800 font-semibold">
                          <span className="text-blue-600 font-mono bg-blue-50 px-3 py-1 rounded-lg">
                            {result.certificateNumber}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Clear button */}
                      <button
                        onClick={() => {
                          setCertificateNumber("");
                          setResult(null);
                          setSearched(false);
                          setErrorMessage("");
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-red-200"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">
                          {t("common.clear")}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Status Banner */}
                  <div
                    className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                      isValid
                        ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50"
                        : "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {isValid ? (
                          <div className="p-2 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-100 rounded-full">
                            <XCircle className="h-8 w-8 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <h2
                            className={`text-xl font-bold ${
                              isValid ? "text-emerald-800" : "text-amber-800"
                            }`}
                          >
                            {isValid
                              ? t("certificationVerification.certificateValid")
                              : t("certificationVerification.certificateExpired")}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {result.companyName || t("certificationVerification.notSpecified")}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                          isValid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full mr-2 inline-block animate-pulse" />
                        {isValid
                          ? t("certificationVerification.verified")
                          : t("certificationVerification.expired")}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Certificate Details */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:border-blue-200 transition-colors duration-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        {t("certificationVerification.certificateDetails")}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Award className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              {t("certificationVerification.certificateNumber")}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900 break-all">
                              {result.certificateNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <ShieldCheck className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              {t("certificationVerification.certificationType")}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {typeLabel(result.certificationType)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <Building2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              {t("certificationVerification.companyName")}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900 break-words">
                              {result.companyName || t("certificationVerification.notSpecified")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Validity Information */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:border-blue-200 transition-colors duration-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        {t("certificationVerification.validityInformation")}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <CalendarDays className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              {t("certificationVerification.issueDate")}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {formatDate(result.issueDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                          <div className="p-2 bg-rose-50 rounded-lg">
                            <CalendarDays className="h-4 w-4 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              {t("certificationVerification.expiryDate")}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {formatDate(result.expiryDate)}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-4 text-sm font-medium ${
                            isValid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isValid
                            ? t("certificationVerification.certificateActive")
                            : t("certificationVerification.certificateExpiredMessage")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {searched && errorMessage && !result && (
              <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800">
                        {t("certificationVerification.error")}
                      </h3>
                      <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
