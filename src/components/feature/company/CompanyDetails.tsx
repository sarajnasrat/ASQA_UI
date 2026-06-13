import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toast } from "primereact/toast";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Globe,
  Tag,
  FileText,
  Award,
  TrendingUp,
  AlertCircle,
  Hash,
  CreditCard,
  Eye,
  Download,
  File,
  Link2,
  Store,
  Calendar,
  Shield,
  IdCard,
  BookOpen,
  ShieldCheck,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from "lucide-react";

import CompanyService from "../../../services/company.service";
import { handleApi } from "../../../hooks/handleApi";

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const toast = React.useRef<Toast>(null);

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "legal" | "documents">("info");
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    contactInfo: true,
    legalInfo: true,
    businessInfo: true,
    categories: true,
    about: true,
    stats: true,
  });

  const numericId = Number(id);

  const showError = (summary: string, detail?: string) => {
    toast.current?.show({ severity: "error", summary, detail });
  };

  const loadCompanyDetails = async () => {
    if (!numericId) {
      showError(t("common.error"), t("company.invalidId"));
      return;
    }

    setLoading(true);

    const response = await handleApi(
      () => CompanyService.getCompanyById(numericId),
      () => {},
      showError,
      t
    );

    if (response) {
      setCompany(response.data?.data || response.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCompanyDetails();
  }, [numericId]);

  const companyNameField = useMemo(() => {
    switch (i18n.language) {
      case "dr":
        return "companyNameDR";
      case "ps":
        return "companyNamePS";
      default:
        return "companyNameEN";
    }
  }, [i18n.language]);

  const aboutCompanyField = useMemo(() => {
    switch (i18n.language) {
      case "dr":
        return "aboutCompanyDr";
      case "ps":
        return "aboutCompanyPs";
      default:
        return "aboutCompanyEn";
    }
  }, [i18n.language]);

  const ownerNameField = useMemo(() => {
    switch (i18n.language) {
      case "dr":
        return "companyOwnerNameDr";
      case "ps":
        return "companyOwnerNamePs";
      default:
        return "companyOwnerNameEn";
    }
  }, [i18n.language]);

  const companyName = company?.[companyNameField] ||
    company?.companyNameEN ||
    company?.companyNameDR ||
    company?.companyNamePS ||
    "-";

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return IslamicDateFormatter.formatQamari(value);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    return IslamicDateFormatter.formatQamari(value, true);
  };

  const labelize = (value?: string) =>
    value
      ? value
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "-";

  const assetUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:8080";
    return `${baseUrl}${path}`;
  };

  const getCompanyTypeLabel = (type?: string) => {
    if (!type) return "-";
    const typeKey = `company.typeOptions.${type}`;
    const translated = t(typeKey);
    return translated === typeKey ? labelize(type) : translated;
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "-";
    const statusKey = `company.status.${status}`;
    const translated = t(statusKey);
    return translated === statusKey ? labelize(status) : translated;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes("facebook")) return <Facebook className="h-4 w-4" />;
    if (platformLower.includes("twitter") || platformLower.includes("x")) return <Twitter className="h-4 w-4" />;
    if (platformLower.includes("linkedin")) return <Linkedin className="h-4 w-4" />;
    if (platformLower.includes("instagram")) return <Instagram className="h-4 w-4" />;
    if (platformLower.includes("youtube")) return <Youtube className="h-4 w-4" />;
    return <Link2 className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("company.notFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("company.messages.noData")}
          </p>
          <button
            onClick={() => navigate("/company")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("common.back")}
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {companyName}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        company.isActive || company.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${company.isActive || company.active ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      {company.isActive || company.active
                        ? t("company.status.ACTIVE")
                        : t("company.status.INACTIVE")}
                    </span>
                    {company.companyType && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        <Briefcase className="h-3 w-3" />
                        {getCompanyTypeLabel(company.companyType)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      <span>
                        {t("company.labels.companyId") || "Company ID"}: {company.id || t("common.notSpecified")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {t("company.table.createdAt")}: {formatDateTime(company.createdDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/company/edit/${id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    {t("common.edit")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 md:gap-6">
              {[
                {
                  id: "info",
                  label: t("company.sections.companyInfo"),
                  icon: <Building2 className="h-4 w-4" />,
                },
                {
                  id: "legal",
                  label: t("company.sections.registrationInfo"),
                  icon: <Shield className="h-4 w-4" />,
                },
                {
                  id: "documents",
                  label: t("company.sections.documents"),
                  icon: <File className="h-4 w-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === "info"
                      ? t("common.info")
                      : tab.id === "legal"
                      ? t("common.legal")
                      : t("common.documents")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Company Profile Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header with Cover Style */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
                      <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                          {company.logoUrl ? (
                            <img
                              src={assetUrl(company.logoUrl)}
                              alt={companyName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-12 w-12 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="pt-16 px-6 pb-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {companyName}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {company.email && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Mail className="h-3 w-3" />
                                {company.email}
                              </span>
                            )}
                            {company.phoneNumber && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {company.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        {company.websiteUrl && (
                          <a
                            href={company.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm"
                          >
                            <Globe className="h-4 w-4" />
                            {t("company.labels.visitWebsite")}
                          </a>
                        )}
                      </div>

                      {/* About Section */}
                      {company?.[aboutCompanyField] && (
                        <div className="mb-6">
                          <button
                            onClick={() => toggleSection("about")}
                            className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors rounded-lg px-3"
                          >
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              {t("company.labels.aboutCompany")}
                            </h4>
                            {expandedSections.about ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          {expandedSections.about && (
                            <div className="px-3 pt-2 pb-4">
                              <p className="text-gray-700 leading-relaxed">
                                {company[aboutCompanyField]}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="mb-6">
                        <button
                          onClick={() => toggleSection("contactInfo")}
                          className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors rounded-lg px-3"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="h-5 w-5 text-blue-600" />
                            {t("company.sections.contactInfo")}
                          </h4>
                          {expandedSections.contactInfo ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {expandedSections.contactInfo && (
                          <div className="px-3 pt-2 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    {t("company.labels.email")}
                                  </p>
                                  <p className="font-medium text-gray-900 break-all">
                                    {company.email || t("common.notSpecified")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    {t("company.labels.phoneNumber")}
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {company.phoneNumber || t("common.notSpecified")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl md:col-span-2">
                                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    {t("company.labels.address")}
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {company.address || company.mainBranchAddress || t("common.notSpecified")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl md:col-span-2">
                                <Store className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    {t("company.labels.activityPlace")}
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {company.activityPlace || t("common.notSpecified")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Categories */}
                      {company.categories?.length > 0 && (
                        <div className="mb-6">
                          <button
                            onClick={() => toggleSection("categories")}
                            className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors rounded-lg px-3"
                          >
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <Tag className="h-5 w-5 text-blue-600" />
                              {t("company.labels.categories")}
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {company.categories.length}
                              </span>
                            </h4>
                            {expandedSections.categories ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          {expandedSections.categories && (
                            <div className="px-3 pt-2 pb-4">
                              <div className="flex flex-wrap gap-2">
                                {company.categories.map((category: any) => (
                                  <span
                                    key={category.id}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-sm"
                                  >
                                    {category.categoryName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Business Information */}
                      <div>
                        <button
                          onClick={() => toggleSection("businessInfo")}
                          className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors rounded-lg px-3"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            {t("company.sections.companyInfo")}
                          </h4>
                          {expandedSections.businessInfo ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {expandedSections.businessInfo && (
                          <div className="px-3 pt-2 pb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                                <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                                  {t("company.labels.ownerName")}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  {company[ownerNameField] ||
                                    company.companyOwnerNameEn ||
                                    "-"}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                                <p className="text-xs text-green-600 uppercase tracking-wide mb-1">
                                  {t("company.labels.establishYear")}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatDate(company.establishYear)}
                                </p>
                              </div>
                              {company.activityType && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                                  <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">
                                    {t("company.labels.activityType")}
                                  </p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {company.activityType}
                                  </p>
                                </div>
                              )}
                              {company.tinNumber && (
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                                  <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">
                                    {t("company.labels.tinNumber")}
                                  </p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {company.tinNumber}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats and Additional Info */}
                <div className="space-y-6">
                  {/* Company Stats Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleSection("stats")}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        {t("company.companyStats")}
                      </h3>
                      {expandedSections.stats ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.stats && (
                      <div className="px-6 pb-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">
                              {t("company.labels.companyType")}
                            </span>
                            <span className="font-semibold text-gray-900 px-2 py-1 bg-blue-50 rounded-lg text-sm">
                              {getCompanyTypeLabel(company.companyType)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">
                              {t("company.categoriesCount")}
                            </span>
                            <span className="font-semibold text-gray-900 px-2 py-1 bg-purple-50 rounded-lg text-sm">
                              {company.categories?.length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">
                              {t("company.table.status")}
                            </span>
                            <span
                              className={`font-semibold px-2 py-1 rounded-lg text-sm ${
                                company.isActive || company.active
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {getStatusLabel(company.isActive || company.active ? "ACTIVE" : "INACTIVE")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                    <Building2 className="h-12 w-12 mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">
                      {t("company.quickContact")}
                    </h3>
                    <p className="text-blue-100 mb-4">
                      {t("company.messages.updateSuccess")}
                    </p>
                    <button
                      onClick={() => navigate(`/company/edit/${id}`)}
                      className="w-full mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      {t("common.edit")}
                    </button>
                  </div>

                  {/* Social Links Card */}
                  {company.socialLinks && company.socialLinks.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Link2 className="h-5 w-5 text-blue-600" />
                        {t("company.socialLinks")}
                      </h3>
                      <div className="space-y-2">
                        {company.socialLinks.map((link: any, index: number) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          >
                            {getSocialIcon(link.platform)}
                            <span className="flex-1 text-gray-700">
                              {link.platform}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === "legal" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Jawaz Information */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {t("company.jawazInformation")}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <IdCard className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("company.labels.jawazNumber")}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {company.jawazNumber || t("common.notSpecified")}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                {t("company.labels.jawazIssueDate")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDate(company.jawazIssueDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <Calendar className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                {t("company.labels.jawazExpiryDate")}
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDate(company.jawazExpiryDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Information */}
                  {(company.tinNumber || company.companyRegistrationNumber) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        {t("company.registrationInfo")}
                      </h3>
                      <div className="space-y-3">
                        {company.companyRegistrationNumber && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">
                              {t("company.labels.registrationNumber") || "Registration Number"}
                            </span>
                            <span className="font-medium text-gray-900">
                              {company.companyRegistrationNumber}
                            </span>
                          </div>
                        )}
                        {company.tinNumber && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">
                              {t("company.labels.tinNumber")}
                            </span>
                            <span className="font-medium text-gray-900">
                              {company.tinNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Compliance Status */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                      {t("company.status.title")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          {t("company.labels.verifiedCompany")}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("company.labels.verifiedCompany")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">
                          {t("company.labels.registeredMember")}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                          <Award className="h-3 w-3" />
                          {t("company.labels.registeredMember")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white">
                    <ShieldCheck className="h-12 w-12 mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">
                      {t("company.labels.verifiedCompany")}
                    </h3>
                    <p className="text-green-100">
                      {t("company.labels.verifiedMessage")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Documents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t("company.sections.documents")}
                  </h3>
                  {company.documents?.length > 0 ? (
                    <div className="space-y-3">
                      {company.documents.map((doc: any, index: number) => (
                        <div
                          key={doc.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <File className="h-5 w-5 text-blue-500 shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {doc.name || doc.fileName || t("company.sections.documents")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} ${t("attachment.sizeUnitKb")}` : t("company.messages.unknownSize")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={assetUrl(doc.filePath || doc.file)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <a
                              href={assetUrl(doc.filePath || doc.file)}
                              download
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.download")}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {t("company.messages.noData")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Certificates */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    {t("company.sections.certificates")}
                  </h3>
                  {company.certificates?.length > 0 ? (
                    <div className="space-y-3">
                      {company.certificates.map((cert: any, index: number) => (
                        <div
                          key={cert.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Award className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {cert.name || cert.certificateName || t("company.sections.certificates")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {cert.issueDate && `${t("company.labels.issueDate")}: ${formatDate(cert.issueDate)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={assetUrl(cert.filePath || cert.file)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <a
                              href={assetUrl(cert.filePath || cert.file)}
                              download
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.download")}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {t("company.messages.noData")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Logos Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {t("company.companyLogos")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-gray-50 rounded-2xl shadow-md flex items-center justify-center overflow-hidden">
                          {company.logoUrl ? (
                            <img
                              src={assetUrl(company.logoUrl)}
                              alt={t("company.labels.companyLogo")}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <p className="mt-3 font-medium text-gray-700">
                          {t("company.labels.companyLogo")}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-gray-50 rounded-2xl shadow-md flex items-center justify-center overflow-hidden">
                          {company.bussinessLogoUrl ? (
                            <img
                              src={assetUrl(company.bussinessLogoUrl)}
                              alt={t("company.labels.businessLogo")}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Briefcase className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <p className="mt-3 font-medium text-gray-700">
                          {t("company.labels.businessLogo")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyDetails;
