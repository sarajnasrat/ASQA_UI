import React from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  FileText,
  Tag,
  Shield,
  TrendingUp,
  User,
  ChevronUp,
  ChevronDown,
  MapPin,
  Home,
  Building,
  Map,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import type { CertificationRequest, ContactPerson, Address } from "./CertificationRequestView.types";

type CompanySection = "contactPersonDetails";

interface Props {
  request: CertificationRequest;
  getCompanyName: () => string | undefined;
  getAboutCompany: () => string | undefined;
  getAddressTypeLabel: (addressType: string) => string;
  formatDate: (dateString: string) => string;
  toggleSection: (section: CompanySection) => void;
  expandedSections: {
    contactPersonDetails: boolean;
  };
  contactPerson?: ContactPerson;
  apiBaseUrl: string;
  t: any;
}

const CertificationRequestViewCompany: React.FC<Props> = ({
  request,
  getCompanyName,
  getAboutCompany,
  getAddressTypeLabel,
  formatDate,
  toggleSection,
  expandedSections,
  contactPerson,
  apiBaseUrl,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative h-32 bg-linear-to-r from-blue-600 to-indigo-600">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                {request.company.logoUrl ? (
                  <img
                    src={`${apiBaseUrl}${request.company.logoUrl}`}
                    alt={request.company.companyNameEN}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 px-6 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{getCompanyName()}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                    {request.company.companyType?.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      request.company.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        request.company.active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {request.company.active ? t("company.labels.active") : t("company.labels.inactive")}
                  </span>
                </div>
              </div>
              {request.company.websiteUrl && (
                <a
                  href={request.company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm"
                >
                  <Globe className="h-4 w-4" />
                  {t("company.labels.visitWebsite")}
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t("company.labels.email")}</p>
                  <p className="font-medium text-gray-900 break-all">{request.company.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t("company.labels.phoneNumber")}</p>
                  <p className="font-medium text-gray-900">{request.company.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl md:col-span-2">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t("company.labels.address")}</p>
                  <p className="font-medium text-gray-900">{request.company.address}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                {t("company.labels.businessInformation")}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">{t("company.labels.jawazNumber")}</p>
                  <p className="text-lg font-bold text-gray-900">{request.company.jawazNumber}</p>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">{t("company.labels.jawazIssueDate")}</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(request.company.jawazIssueDate)}</p>
                </div>
                <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-4">
                  <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">{t("company.labels.jawazExpiryDate")}</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(request.company.jawazExpiryDate)}</p>
                </div>
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-green-600 uppercase tracking-wide mb-1">{t("company.labels.establishYear")}</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(request.company.establishYear)}</p>
                </div>
                <div className="bg-linear-to-br from-cyan-50 to-sky-50 rounded-xl p-4">
                  <p className="text-xs text-cyan-600 uppercase tracking-wide mb-1">{t("company.labels.activityPlace")}</p>
                  <p className="text-lg font-bold text-gray-900">{request.company.activityPlace}</p>
                </div>
                <div className="bg-linear-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">{t("company.labels.ownerNameEn")}</p>
                  <p className="text-lg font-bold text-gray-900">{request.company.companyOwnerNameEn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {t("company.labels.aboutCompany")}
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{getAboutCompany()}</p>
            </div>
          </div>
        </div>

        {request.company.categories && request.company.categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                {t("company.labels.categories")}
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {request.company.categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow cursor-default"
                  >
                    {category.categoryName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {request.company.bussinessLogoUrl && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {t("company.labels.businessLogo")}
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                <img
                  src={`${apiBaseUrl}${request.company.bussinessLogoUrl}`}
                  alt="Business Logo"
                  className="max-h-48 object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-linear-to-br from-green-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Shield className="h-32 w-32" />
          </div>
          <Shield className="h-12 w-12 mb-4 relative z-10" />
          <h3 className="text-xl font-bold mb-2 relative z-10">{t("company.labels.verifiedCompany")}</h3>
          <p className="text-green-100 mb-4 relative z-10 text-sm">{t("company.labels.verifiedMessage")}</p>
          <div className="inline-flex items-center gap-2 text-sm relative z-10 bg-white/20 rounded-lg px-3 py-2">
            <CheckCircle className="h-4 w-4" />
            <span>{t("company.labels.registeredMember")}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t("company.labels.companyStats")}
            </h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">{t("company.labels.companyType")}</span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-blue-50 rounded-lg text-sm">
                {request.company.companyType?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">{t("company.labels.categoriesCount")}</span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-purple-50 rounded-lg text-sm">
                {request.company.categories?.length || 0} {t("company.labels.categories")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">{t("company.labels.documentsCount")}</span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-green-50 rounded-lg text-sm">
                {request.company.attachments?.length || 0} {t("company.labels.documents")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">{t("company.labels.socialLinks")}</span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-amber-50 rounded-lg text-sm">
                {request.company.socialLinks?.length || 0} {t("company.labels.links")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              {t("company.labels.quickContact")}
            </h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            <button
              onClick={() => (window.location.href = `mailto:${request.company.email}`)}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <Mail className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 flex-1 text-left">{request.company.email}</span>
            </button>
            <button
              onClick={() => (window.location.href = `tel:${request.company.phoneNumber}`)}
              className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <Phone className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 flex-1 text-left">{request.company.phoneNumber}</span>
            </button>
            {request.company.websiteUrl && (
              <button
                onClick={() => window.open(request.company.websiteUrl, "_blank")}
                className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
              >
                <Globe className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700 flex-1 text-left">{t("company.labels.visitWebsite")}</span>
              </button>
            )}
          </div>
        </div>

        {contactPerson && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection("contactPersonDetails")}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                {t("contactPerson.info")}
              </h3>
              {expandedSections.contactPersonDetails ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSections.contactPersonDetails && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {t("contactPerson.firstName")} & {t("contactPerson.lastName")}
                      </p>
                      <p className="font-semibold text-gray-900">{contactPerson.firstName} {contactPerson.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl">
                    <Briefcase className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t("contactPerson.position")}</p>
                      <p className="font-semibold text-gray-900">{contactPerson.position || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => (window.location.href = `mailto:${contactPerson.email}`)}
                    className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
                  >
                    <Mail className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{t("contactPerson.email")}</p>
                      <p className="font-medium text-gray-800 group-hover:text-gray-900">{contactPerson.email}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => (window.location.href = `tel:${contactPerson.phoneNumber}`)}
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                  >
                    <Phone className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{t("contactPerson.phoneNumber")}</p>
                      <p className="font-medium text-gray-800 group-hover:text-gray-900">{contactPerson.phoneNumber}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {contactPerson.addresses && contactPerson.addresses.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-800 text-sm">{t("contactPerson.addresses.title")}</h4>
                    </div>
                    <div className="space-y-3">
                      {contactPerson.addresses.map((address: Address) => (
                        <div
                          key={address.id}
                          className="bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                              {address.addressType === "HOME" && <Home className="h-3 w-3" />}
                              {address.addressType === "HEAD_OFFICE" && <Building className="h-3 w-3" />}
                              {address.addressType === "BRANCH_OFFICE" && <Building2 className="h-3 w-3" />}
                              {address.addressType === "OTHER" && <Map className="h-3 w-3" />}
                              {getAddressTypeLabel(address.addressType)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                              <span>{address.district?.districtName}, {address.district?.province?.provinceName}</span>
                            </p>
                            <p className="text-gray-600 pl-5">{address.details}</p>
                            <p className="text-xs text-gray-500 pl-5">{address.district?.province?.country?.countryName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationRequestViewCompany;
