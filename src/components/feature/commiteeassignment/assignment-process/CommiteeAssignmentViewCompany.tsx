import React from "react";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";
import type {
  Address,
  Assignment,
  ContactPerson,
} from "./CommiteeAssignmentView.types";

type CompanySection = "contactPersonDetails";

interface Props {
  assignment: Assignment;
  getCompanyName: () => string | undefined;
  getAboutCompany: () => string | undefined;
  formatDate: (dateString?: string | null) => string;
  toggleSection: (section: CompanySection) => void;
  expandedSections: {
    contactPersonDetails: boolean;
  };
  contactPerson?: ContactPerson;
  apiBaseUrl: string;
  t: any;
}

const getAddressLine = (address: Address) =>
  [
    address.district?.districtName,
    address.district?.province?.provinceName,
    address.district?.province?.country?.countryName,
  ]
    .filter(Boolean)
    .join(", ");

const CommiteeAssignmentViewCompany: React.FC<Props> = ({
  assignment,
  getCompanyName,
  getAboutCompany,
  formatDate,
  toggleSection,
  expandedSections,
  contactPerson,
  apiBaseUrl,
  t,
}) => {
  const company = assignment.certificationRequest?.company;

  if (!company) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative h-32 bg-linear-to-r from-blue-600 to-indigo-600">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                {company.logoUrl ? (
                  <img
                    src={`${apiBaseUrl}${company.logoUrl}`}
                    alt={company.companyNameEN}
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
                <h3 className="text-2xl font-bold text-gray-900">
                  {getCompanyName() || "-"}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                    {t(`company.typeOptions.${company.companyType}`) ||
                      company.companyType?.replace(/_/g, " ") ||
                      "-"}
                  </span>
                  {/* <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      company.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        company.active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {company.active
                      ? t("company.labels.active")
                      : t("company.labels.inactive")}
                  </span> */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("company.labels.email")}
                  </p>
                  <p className="font-medium text-gray-900 break-all">
                    {company.email || "-"}
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
                    {company.phoneNumber || "-"}
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
                    {company.address || "-"}
                  </p>
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
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                    {t("company.labels.jawazNumber")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {company.jawazNumber || "-"}
                  </p>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">
                    {t("company.labels.jawazIssueDate")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(company.jawazIssueDate)}
                  </p>
                </div>
                <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-4">
                  <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">
                    {t("company.labels.jawazExpiryDate")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(company.jawazExpiryDate)}
                  </p>
                </div>
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-green-600 uppercase tracking-wide mb-1">
                    {t("company.labels.establishYear")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(company.establishYear)}
                  </p>
                </div>
                <div className="bg-linear-to-br from-cyan-50 to-sky-50 rounded-xl p-4">
                  <p className="text-xs text-cyan-600 uppercase tracking-wide mb-1">
                    {t("company.labels.activityPlace")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {company.activityPlace || "-"}
                  </p>
                </div>
                <div className="bg-linear-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
                    {t("company.labels.ownerNameEn")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {company.companyOwnerNameEn || "-"}
                  </p>
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
            <p className="text-gray-700 leading-relaxed">
              {getAboutCompany() || "-"}
            </p>
          </div>
        </div>

        {company.categories && company.categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                {t("company.labels.categories")}
              </h3>
            </div>
            <div className="px-6 py-4 flex flex-wrap gap-2">
              {company.categories.map((category) => (
                <span
                  key={category.id}
                  className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium"
                >
                  {category.categoryName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t("company.labels.companyStats")}
            </h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">
                {t("company.labels.companyType")}
              </span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-blue-50 rounded-lg text-sm">
                {t(`company.typeOptions.${company.companyType}`) ||
                  company.companyType?.replace(/_/g, " ") ||
                  "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">
                {t("company.labels.categoriesCount")}
              </span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-purple-50 rounded-lg text-sm">
                {company.categories?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">
                {t("company.labels.documentsCount")}
              </span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-green-50 rounded-lg text-sm">
                {company.attachments?.length || 0}
              </span>
            </div>
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
                <div className="space-y-3 mb-6">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {t("contactPerson.firstName")} &{" "}
                      {t("contactPerson.lastName")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {`${contactPerson.firstName || ""} ${contactPerson.lastName || ""}`.trim() ||
                        "-"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {t("contactPerson.position")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {contactPerson.position || "-"}
                    </p>
                  </div>
                </div>

                {contactPerson.email && (
                  <button
                    onClick={() =>
                      (window.location.href = `mailto:${contactPerson.email}`)
                    }
                    className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all group mb-3"
                  >
                    <Mail className="h-5 w-5 text-green-600" />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {t("contactPerson.email")}
                      </p>
                      <p className="font-medium text-gray-800">
                        {contactPerson.email}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                {contactPerson.phoneNumber && (
                  <button
                    onClick={() =>
                      (window.location.href = `tel:${contactPerson.phoneNumber}`)
                    }
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                  >
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {t("contactPerson.phoneNumber")}
                      </p>
                      <p className="font-medium text-gray-800">
                        {contactPerson.phoneNumber}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                {contactPerson.addresses &&
                  contactPerson.addresses.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                      {contactPerson.addresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-xl bg-gray-50 border border-gray-100 p-4"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {address.addressType || "-"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {getAddressLine(address) || "-"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.details || "-"}
                          </p>
                        </div>
                      ))}
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

export default CommiteeAssignmentViewCompany;
