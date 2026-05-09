import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CertificationRequestTracker from "./CertificationRequestTracker";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Search, FileText, ChevronLeft, ChevronRight, X, Building2 } from "lucide-react";

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
    // Simulate API call (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // use whatever user typed
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

        <div className="relative container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
              <Building2 className="h-4 w-4 text-blue-200" />
              <span className="text-sm font-medium">
                {t("certification.trackBadge")}
              </span>
            </div>

            {/* Main heading with gradient text */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="bg-linear-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                {t("certification.trackTitle")}
              </span>
              <br />
              <span className="bg-linear-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                {t("certification.certificationStatus")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("certification.trackDescription")}
            </p>

            {/* Search bar with enhanced design - CORRECTED VERSION */}
            <div className="relative max-w-2xl mx-auto pb-20">
              {/* Glow effect behind search */}
              <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-30"></div>
              
              {/* Search container */}
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl">
                {/* Search Icon */}
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                
                {/* Input Field */}
                <input
                  type="text"
                  placeholder={t("certification.searchPlaceholder")}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-14 pr-36 py-5 text-gray-700 bg-transparent focus:outline-none text-lg rounded-2xl"
                  dir={t("direction") === "rtl" ? "rtl" : "ltr"}
                />
                
                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{t("common.searching")}</span>
                    </div>
                  ) : (
                    <span>{t("common.search")}</span>
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
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          // Loading State
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
              <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <p className="mt-6 text-gray-600 text-lg">
              {t("certification.searchingMessage")}
            </p>
          </div>
        ) : (
          <>
            {/* Result Section */}
            {searched && requestId && (
              <div className="max-w-4xl mx-auto">
                {/* Result header with count */}
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-lg">
                      {t("certification.showingResult")}{" "}
                      <span className="font-semibold text-blue-600">
                        {t("certification.request")} #{requestId}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    {t("common.clear")}
                  </button>
                </div>

                {/* Certification Tracker Card */}
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Top accent border */}
                  <div className="h-1 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {t("certification.requestDetails")}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {t("certification.trackProgress")}
                        </p>
                      </div>
                    </div>

                    <CertificationRequestTracker requestId={requestId} />
                  </div>
                </div>
              </div>
            )}

            {/* Empty State - No results found */}
            {searched && !requestId && (
              <div className="max-w-2xl mx-auto text-center py-20">
                <div className="inline-block p-8 bg-white rounded-full shadow-xl mb-6">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {t("certification.noResults")}
                </h3>
                <p className="text-gray-500 text-lg mb-6">
                  {t("certification.noResultsMessage")}
                </p>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Search className="h-4 w-4" />
                  {t("certification.tryAnotherSearch")}
                </button>
              </div>
            )}

            {/* Initial State - No search performed */}
            {!searched && !isLoading && (
              <div className="max-w-3xl mx-auto">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="inline-flex p-3 bg-blue-50 rounded-full mb-4">
                      <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t("certification.easyTracking")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("certification.easyTrackingDesc")}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="inline-flex p-3 bg-green-50 rounded-full mb-4">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t("certification.realTimeUpdates")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("certification.realTimeUpdatesDesc")}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="inline-flex p-3 bg-purple-50 rounded-full mb-4">
                      <svg
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t("certification.secureReliable")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("certification.secureReliableDesc")}
                    </p>
                  </div>
                </div>

                {/* Example Section */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3 text-center">
                    {t("certification.helpFinding")}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {t("certification.helpFindingDesc")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                      CR-2026-00036
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                      36
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                      202600036
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};