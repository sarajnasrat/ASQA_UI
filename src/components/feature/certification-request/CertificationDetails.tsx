import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CertificationRequestTracker from "./CertificationRequestTracker";

import {
  Search,
  FileText,
  X,
  Building2,
  TrendingUp,
  Shield,
  MessageCircle,
  Clock,
  Lock,
  Globe,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Share2,
  FileSearch,
} from "lucide-react";

export const CertificationDetails = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    const query = searchValue.trim();
    if (!query) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRequestId(query);
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setRequestId(null);
    setSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pt-24">
      {/* Header Section */}
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
              <Building2 className="h-4 w-4 text-blue-200" />
              <span className="text-sm font-medium">
                {t("certification.trackBadge")}
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-linear-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                {t("certification.trackTitle")}
              </span>
              <br />
              <span className="bg-linear-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                {t("certification.certificationStatus")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("certification.trackDescription")}
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto px-4 py-10">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-2xl shadow-2xl p-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                  <input
                    type="text"
                    placeholder={t("certification.searchPlaceholder")}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-4 py-4 text-gray-700 bg-transparent focus:outline-none text-base sm:text-lg rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading || !searchValue.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
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
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
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
        {isLoading ? (
          // Enhanced Loading State
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>

              {/* Spinner with gradient */}
              <div className="relative">
                <div className="animate-spin rounded-full h-24 w-24 border-[3px] border-gray-100 border-t-blue-600 border-r-blue-400 shadow-lg"></div>
                <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-blue-600" />
              </div>
            </div>

            {/* Animated text */}
            <div className="mt-8 space-y-2 text-center">
              <p className="text-gray-700 text-lg font-medium">
                {t("certification.searchingMessage")}
              </p>
              <p className="text-gray-400 text-sm animate-pulse">
                {t("certification.pleaseWait")}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Result Section - Enhanced */}
            {searched && requestId && (
              <div className="max-w-5xl mx-auto animate-fadeIn">
                {/* Enhanced Result Header */}
                <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">
                          {t("certificationRequest.labels.trackingNumber")}
                        </p>
                        <p className="text-gray-800 font-semibold">
                          <span className="text-blue-600 font-mono bg-blue-50 px-3 py-1 rounded-lg">
                            {requestId}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Share button */}

                      {/* Clear button */}
                      <button
                        onClick={handleClear}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-red-200"
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t("common.clear")}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Certification Tracker Component */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <CertificationRequestTracker requestId={requestId} />
                </div>

                {/* Quick Help Footer */}
                {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {t("certification.needHelp")}{" "}
              <button className="text-blue-600 hover:underline font-medium">
                {t("common.contact")}
              </button>
            </p>
          </div> */}
              </div>
            )}

            {/* Enhanced Empty State */}
            {searched && !requestId && (
              <div className="max-w-2xl mx-auto text-center py-16 animate-fadeIn">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-gray-100 rounded-full blur-2xl"></div>
                  <div className="relative bg-white p-8 rounded-full shadow-xl border border-gray-100">
                    <FileSearch className="h-20 w-20 text-gray-300" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {t("certification.noResults")}
                </h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  {t("certification.noResultsMessage")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium"
                  >
                    <Search className="h-5 w-5" />
                    {t("certification.tryAnotherSearch")}
                  </button>

                  <button
                    onClick={() =>
                      (window.location.href = "mailto:support@asqa.af")
                    }
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium border border-gray-200"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {t("certification.contactHelp")}
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Initial State */}
            {!searched && !isLoading && (
              <div className="max-w-5xl mx-auto animate-fadeIn">
                {/* Welcome Section */}
                <div className="text-center mb-16">
                  <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
                    <FileCheck className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {t("certification.welcomeTitle")}
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    {t("certification.welcomeDescription")}
                  </p>
                </div>

                {/* Features Grid - Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {[
                    {
                      icon: Search,
                      color: "blue",
                      title: t("certification.easyTracking"),
                      description: t("certification.easyTrackingDesc"),
                    },
                    {
                      icon: TrendingUp,
                      color: "green",
                      title: t("certification.realTimeUpdates"),
                      description: t("certification.realTimeUpdatesDesc"),
                    },
                    {
                      icon: Shield,
                      color: "purple",
                      title: t("certification.secureReliable"),
                      description: t("certification.secureReliableDesc"),
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                    >
                      {/* Gradient border on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>

                      <div className="relative">
                        <div
                          className={`inline-flex p-4 bg-${feature.color}-50 rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg`}
                        >
                          <feature.icon
                            className={`h-7 w-7 text-${feature.color}-600`}
                          />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {feature.title}
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>

                        {/* Arrow indicator on hover */}
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-blue-600 text-sm font-medium inline-flex items-center gap-1">
                            {t("common.learnMore")}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Help Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 md:p-10 border border-blue-100">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                  <div className="relative">
                    <div className="text-center mb-8">
                      <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-4">
                        <HelpCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        {t("certification.helpFinding")}
                      </h3>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        {t("certification.helpFindingDesc")}
                      </p>
                    </div>

                    {/* Example IDs - Enhanced */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                      {[
                        { id: "CR-2026-00036", label: "Certificate ID" },
                        { id: "REQ-2026-1776", label: "Request ID" },
                        { id: "36", label: "Serial Number" },
                      ].map((example, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                          onClick={() => {
                            // Set the search input value to this example
                            // You'll need to implement this based on your state management
                          }}
                        >
                          <p className="text-xs text-gray-400 mb-1">
                            {example.label}
                          </p>
                          <p className="font-mono text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                            {example.id}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Support Contact - Enhanced */}
                    <div className="text-center pt-6 border-t border-blue-200/50">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span>{t("certification.supportContact")}</span>
                        <a
                          href="mailto:support@asqa.af"
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline ml-1"
                        >
                          support@asqa.af
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 text-center">
                  <div className="inline-flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      <span>{t("certification.sslEncrypted")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{t("certification.instantVerification")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>{t("certification.available24x7")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};
