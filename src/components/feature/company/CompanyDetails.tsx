import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toast } from "primereact/toast";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import CompanyPdfExport, { type CompanyPdfExportHandle } from "../../common/pdf/CompanyPdfExport";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Globe,
  Tag,
  FileText,
  Award,
  AlertCircle,
  Hash,
  Eye,
  Download,
  File,
  Link2,
  Shield,
  BookOpen,
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
  const pdfExportRef = React.useRef<CompanyPdfExportHandle>(null);

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "info" | "legal" | "certification" | "documents"
  >("info");
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    contactInfo: true,
    legalInfo: true,
    businessInfo: true,
    categories: true,
    contactPersons: true,
    about: true,
    logos: true,
    stats: true,
  });

  const numericId = Number(id);

  const showError = (summary: string, detail?: string) => {
    toast.current?.show({ severity: "error", summary, detail });
  };

  const showSuccess = (summary: string, detail?: string) => {
    toast.current?.show({ severity: "success", summary, detail });
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
      t,
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

  const ownerNameLabelKey = useMemo(() => {
    switch (i18n.language) {
      case "dr":
        return "company.labels.ownerNameDr";
      case "ps":
        return "company.labels.ownerNamePs";
      default:
        return "company.labels.ownerNameEn";
    }
  }, [i18n.language]);

  const companyName =
    company?.[companyNameField] ||
    company?.companyNameEN ||
    company?.companyNameDR ||
    company?.companyNamePS ||
    "-";
  const companyAttachments = [...(company?.attachments || [])].reverse();
  const companyContactPersons = company?.contactPersons || [];
  const companyCertificationRequests = company?.certificationRequests || [];
  const companyCertifications = [...(company?.certifications || [])].sort(
    (a: any, b: any) =>
      new Date(b?.createdDate || b?.issueDate || 0).getTime() -
      new Date(a?.createdDate || a?.issueDate || 0).getTime(),
  );

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes("facebook"))
      return <Facebook className="h-4 w-4" />;
    if (platformLower.includes("twitter") || platformLower.includes("x"))
      return <Twitter className="h-4 w-4" />;
    if (platformLower.includes("linkedin"))
      return <Linkedin className="h-4 w-4" />;
    if (platformLower.includes("instagram"))
      return <Instagram className="h-4 w-4" />;
    if (platformLower.includes("youtube"))
      return <Youtube className="h-4 w-4" />;
    return <Link2 className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return t("company.messages.unknownSize");
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      sizes.length - 1,
    );
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${sizes[index]}`;
  };

  const formatContactAddress = (address: any) =>
    [address?.district?.districtName, address?.details]
      .filter(Boolean)
      .join(" - ") || t("common.notSpecified");

  const phoneDisplayClass =
    "inline-block text-left [direction:ltr] [unicode-bidi:isolate]";
  const aboutCompany =
    company?.aboutCompanyEn ||
    company?.aboutCompanyDr ||
    company?.aboutCompanyPs ||
    "";

  const companyInfoItems = [
    {
      label: t("company.labels.companyType"),
      value: getCompanyTypeLabel(company?.companyType),
    },
    {
      label: t("company.labels.ownerNameEn"),
      value:
        company?.companyOwnerNameEn ||
        company?.[ownerNameField] ||
        t("common.notSpecified"),
    },
    {
      label: t("company.labels.ownerNameDr"),
      value: company?.companyOwnerNameDr || t("common.notSpecified"),
    },
    {
      label: t("company.labels.establishYear"),
      value: formatDate(company?.establishYear),
    },
    {
      label: t("company.labels.email"),
      value: company?.email || t("common.notSpecified"),
    },

    {
      label: t("company.labels.mainBranchAddress"),
      value: company?.mainBranchAddress || t("common.notSpecified"),
    },
    {
      label: t("company.labels.activityPlace"),
      value: company?.activityPlace || t("common.notSpecified"),
    },
    {
      label: t("company.labels.activityType"),
      value: company?.activityType || t("common.notSpecified"),
    },
    {
      label: t("company.labels.jawazNumber"),
      value: company?.jawazNumber || t("common.notSpecified"),
    },
    {
      label: t("company.labels.jawazIssueDate"),
      value: formatDate(company?.jawazIssueDate),
    },
    {
      label: t("company.labels.jawazExpiryDate"),
      value: formatDate(company?.jawazExpiryDate),
    },
    {
      label: t("company.labels.tinNumber"),
      value: company?.tinNumber || t("common.notSpecified"),
    },
    {
      label: t("company.table.createdAt"),
      value: formatDateTime(company?.createdDate),
    },
  ];
  const companyAddressItem = {
    label: t("company.labels.address"),
    value: company?.address || t("common.notSpecified"),
  };

  const handleDownloadPdf = async () => {
    if (!company) {
      showError(t("common.error"), t("company.messages.noData"));
      return;
    }

    try {
      await pdfExportRef.current?.downloadPdf();
      showSuccess(t("common.success"), t("common.download"));
    } catch (error) {
      console.error("Error generating company PDF:", error);
      showError(t("common.error"), t("registration.errors.submitFailed"));
    }
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
          <p className="text-gray-600 mb-6">{t("company.messages.noData")}</p>
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
                        {t("common.id")}:{" "}
                        {company.id || t("common.notSpecified")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {t("company.table.createdAt")}:{" "}
                        {formatDateTime(company.createdDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t("common.download")}
                  </button>
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
                  id: "certification",
                  label: t("company.sections.certificates"),
                  icon: <Award className="h-4 w-4" />,
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
                        : tab.id === "certification"
                          ? t("company.sections.certificates")
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
                    <div className="pt-16 px-5 pb-5">
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
                                <span className={phoneDisplayClass} dir="ltr">
                                  {company.phoneNumber}
                                </span>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {companyInfoItems.map((item, index) => (
                          <div
                            key={`${item.label}-${index}`}
                            className={`rounded-xl border border-gray-200 p-3 ${item.className || ""}`}
                          >
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              {item.label}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 break-words leading-relaxed">
                              {item.value || t("common.notSpecified")}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl border border-gray-200 p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {companyAddressItem.label}
                        </p>
                        <p className="text-xs sm:text-sm font-normal text-gray-800 break-words leading-relaxed">
                          {companyAddressItem.value}
                        </p>
                      </div>

                      {company.categories?.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <Tag className="h-5 w-5 text-blue-600" />
                            {t("company.labels.categories")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {company.categories.map((category: any) => (
                              <span
                                key={category.id}
                                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-full text-sm font-medium"
                              >
                                {category.categoryName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aboutCompany && (
                        <div className="mt-6 rounded-xl border border-gray-200">
                          <button
                            onClick={() => toggleSection("about")}
                            className="w-full flex items-center justify-between p-3 text-left"
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
                            <div className="px-3 pb-3">
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                {aboutCompany}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-6 rounded-xl border border-gray-200">
                        <button
                          onClick={() => toggleSection("logos")}
                          className="w-full flex items-center justify-between p-3 text-left"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            {t("company.companyLogos")}
                          </h4>
                          {expandedSections.logos ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {expandedSections.logos && (
                          <div className="px-3 pb-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="text-center">
                                <div className="w-32 h-32 mx-auto rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden">
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
                                <div className="w-32 h-32 mx-auto rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden">
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {companyContactPersons.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => toggleSection("contactPersons")}
                        className="w-full flex items-center justify-between p-5 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Phone className="h-5 w-5 text-blue-600" />
                          {t("contactPerson.info")} (
                          {companyContactPersons.length})
                        </h4>
                        {expandedSections.contactPersons ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      {expandedSections.contactPersons && (
                        <div className="px-5 pb-5 space-y-4">
                          {companyContactPersons.map(
                            (person: any, index: number) => (
                              <div
                                key={person.id || index}
                                className="p-3 rounded-xl border border-gray-200"
                              >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {[person.firstName, person.lastName]
                                        .filter(Boolean)
                                        .join(" ") || t("common.notSpecified")}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {person.position ||
                                        t("common.notSpecified")}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                                      person.active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        person.active
                                          ? "bg-green-500"
                                          : "bg-gray-400"
                                      }`}
                                    />
                                    {person.active
                                      ? t("company.status.ACTIVE")
                                      : t("company.status.INACTIVE")}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                    <span>
                                      {person.email || t("common.notSpecified")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="h-4 w-4 text-blue-500" />
                                    <span
                                      className={phoneDisplayClass}
                                      dir="ltr"
                                    >
                                      {person.phoneNumber ||
                                        t("common.notSpecified")}
                                    </span>
                                  </div>
                                </div>
                                {person.addresses?.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {person.addresses.map(
                                      (address: any, addressIndex: number) => (
                                        <div
                                          key={address.id || addressIndex}
                                          className="flex items-start gap-2 text-sm text-gray-600"
                                        >
                                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                          <span>
                                            {formatContactAddress(address)}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === "legal" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {companyCertificationRequests.length > 0 ? (
                  companyCertificationRequests
                    .slice()
                    .sort(
                      (a: any, b: any) =>
                        new Date(b?.createdDate || 0).getTime() -
                        new Date(a?.createdDate || 0).getTime(),
                    )
                    .map((request: any, index: number) => (
                      <div
                        key={request.id || index}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <Shield className="h-5 w-5 text-blue-600" />
                              {request.trackingNumber ||
                                request.serialNumber ||
                                `#${request.id}`}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {t(
                                `certificationRequest.typeOptions.${request.requestType}`,
                                labelize(request.requestType),
                              )}{" "}
                              -{" "}
                              {t(
                                `certificationRequest.statusOptions.${request.requestStatus}`,
                                labelize(request.requestStatus),
                              )}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              index === 0
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {index === 0
                              ? t("common.currentDocument")
                              : t("common.oldDocument")}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certificationRequest.labels.requestType")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {t(
                                `certificationRequest.typeOptions.${request.requestType}`,
                                labelize(request.requestType),
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certificationRequest.labels.requestStatus")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {t(
                                `certificationRequest.statusOptions.${request.requestStatus}`,
                                labelize(request.requestStatus),
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t(
                                "certificationRequest.labels.certificationType",
                              )}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {t(
                                `certificationRequest.certificationTypeOptions.${request.certificationType}`,
                                labelize(request.certificationType),
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certificationRequest.labels.serialNumber")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {request.serialNumber || t("common.notSpecified")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certificationRequest.labels.trackingNumber")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {request.trackingNumber ||
                                t("common.notSpecified")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certificationRequest.labels.createdDate")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {formatDateTime(request.createdDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certificationRequest.labels.startDate")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {formatDateTime(request.startDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certificationRequest.labels.endDate")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {formatDateTime(request.endDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certification.printable")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {request.isPrint
                                ? t("common.yes")
                                : t("common.no")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {t("certification.scanned")}
                            </p>
                            <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                              {request.isScanned
                                ? t("common.yes")
                                : t("common.no")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {t("company.messages.noData")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Certification Tab */}
            {activeTab === "certification" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {companyCertifications.length > 0 ? (
                  companyCertifications.map((cert: any, index: number) => (
                    <div
                      key={cert.id || index}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Award className="h-5 w-5 text-blue-600" />
                            {cert.certificateNumber || `#${cert.id}`}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t(
                              `certificationRequest.certificationTypeOptions.${cert.certificationType}`,
                              labelize(cert.certificationType),
                            )}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            index === 0
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {index === 0
                            ? t("common.currentDocument")
                            : t("common.oldDocument")}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t("certification.certificateNumber")}
                          </p>
                          <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                            {cert.certificateNumber || t("common.notSpecified")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t("certification.requestId")}
                          </p>
                          <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                            {cert.requestId || t("common.notSpecified")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t("certification.certificateStatus")}
                          </p>
                          <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                            {t(
                              `certification.statusOptions.${cert.certificationStatus}`,
                              labelize(cert.certificationStatus),
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t("certification.issueDate")}
                          </p>
                          <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                            {formatDateTime(cert.issueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t("certification.expiryDate")}
                          </p>
                          <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                            {formatDateTime(cert.expiryDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t("certification.createdDate")}
                          </p>
                          <p className="text-xs sm:text-sm font-normal text-gray-800 leading-relaxed">
                            {formatDateTime(cert.createdDate)}
                          </p>
                        </div>
                      </div>
                      {(cert.certificateAttachment?.file ||
                        cert.certificateUrl) && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <a
                            href={assetUrl(
                              cert.certificateAttachment?.file ||
                                cert.certificateUrl,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            {t("common.view")}
                          </a>
                          <a
                            href={assetUrl(
                              cert.certificateAttachment?.file ||
                                cert.certificateUrl,
                            )}
                            download
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            {t("common.download")}
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {t("company.messages.noData")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Documents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t("company.labels.companyAttachments")} (
                    {companyAttachments.length})
                  </h3>
                  {companyAttachments.length > 0 ? (
                    <div className="space-y-3">
                      {companyAttachments.map((doc: any, index: number) => (
                        <div
                          key={doc.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <File className="h-5 w-5 text-blue-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {doc.attachmentName ||
                                    doc.name ||
                                    doc.fileName ||
                                    t("company.sections.documents")}
                                </p>
                                {doc.attachmentReferenceType && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                    {t(
                                      `attachment.type.${doc.attachmentReferenceType}`,
                                      labelize(doc.attachmentReferenceType),
                                    )}
                                  </span>
                                )}
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    index === 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {index === 0
                                    ? t("common.currentDocument")
                                    : t("common.oldDocument")}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatFileSize(doc.fileSize)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={assetUrl(doc.file)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title={t("common.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <a
                              href={assetUrl(doc.file)}
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

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t("certificationRequest.labels.requestAttachments")}
                  </h3>
                  {companyCertificationRequests.length > 0 ? (
                    <div className="space-y-4">
                      {companyCertificationRequests
                        .slice()
                        .sort(
                          (a: any, b: any) =>
                            new Date(b?.createdDate || 0).getTime() -
                            new Date(a?.createdDate || 0).getTime(),
                        )
                        .map((request: any, requestIndex: number) => (
                          <div
                            key={request.id || requestIndex}
                            className="rounded-xl border border-gray-200 p-4"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {request.trackingNumber ||
                                    request.serialNumber ||
                                    `#${request.id}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {t(
                                    `certificationRequest.typeOptions.${request.requestType}`,
                                    labelize(request.requestType),
                                  )}{" "}
                                  -{" "}
                                  {t(
                                    `certificationRequest.statusOptions.${request.requestStatus}`,
                                    labelize(request.requestStatus),
                                  )}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  requestIndex === 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {requestIndex === 0
                                  ? t("common.currentDocument")
                                  : t("common.oldDocument")}
                              </span>
                            </div>
                            {request.attachments?.length > 0 ? (
                              <div className="space-y-3">
                                {request.attachments.map(
                                  (doc: any, docIndex: number) => (
                                    <div
                                      key={doc.id || docIndex}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <File className="h-5 w-5 text-blue-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {doc.attachmentName ||
                                                doc.name ||
                                                doc.fileName ||
                                                t("company.sections.documents")}
                                            </p>
                                            {doc.attachmentReferenceType && (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                                {t(
                                                  `attachment.type.${doc.attachmentReferenceType}`,
                                                  labelize(
                                                    doc.attachmentReferenceType,
                                                  ),
                                                )}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3 mt-0.5">
                                            <p className="text-xs text-gray-500">
                                              {formatFileSize(doc.fileSize)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <a
                                          href={assetUrl(doc.file)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                          title={t("common.view")}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </a>
                                        <a
                                          href={assetUrl(doc.file)}
                                          download
                                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                          title={t("common.download")}
                                        >
                                          <Download className="h-4 w-4" />
                                        </a>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                {t("certificationRequest.labels.noAttachments")}
                              </p>
                            )}
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
              </div>
            )}
          </div>
        </div>
      </div>
      <CompanyPdfExport
        ref={pdfExportRef}
        company={company}
        contactPersons={companyContactPersons}
        certificationRequests={companyCertificationRequests}
        certifications={companyCertifications}
        assetUrl={assetUrl}
        filename={`company-details-${company?.id || "export"}.pdf`}
        authorityLogoSrc={`${window.location.origin}/asqanew.png`}
        fallbackLogoSrc={`${window.location.origin}/MOLSA-LOGO.png`}
      />
    </>
  );
};

export default CompanyDetails;
