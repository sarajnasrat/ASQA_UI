import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import UserService from "../../../services/user.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import {
  Mail,
  Phone,
  Shield,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  AtSign,
  Hash,
} from "lucide-react";

export const ViewUserDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getUserById = async () => {
    setLoading(true);
    try {
      const res = await UserService.getUser(Number(id));
      setUser(res.data.data);
    } catch (error) {
      console.error("Failed to load user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getUserById();
    }
  }, [id]);

  const formatRoles = (roles?: any[]) => {
    if (!roles || roles.length === 0) return null;
    return roles.map((r: any) => t(`role.${r?.name}`, r?.name));
  };

  const getRoleBadgeColor = (roleName?: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-50 text-red-700 border-red-200",
      SUPER_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
      MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
      COMPANY_ADMIN: "bg-cyan-50 text-cyan-700 border-cyan-200",
      MONITORING: "bg-orange-50 text-orange-700 border-orange-200",
      COMMITTEE_MEMBER: "bg-green-50 text-green-700 border-green-200",
      INSPECTOR: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
    return colors[roleName || ""] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <>
        <DynamicBreadcrumb
          items={[
            { label: t("user.title"), url: "/users" },
            { label: t("user.details.viewUser"), url: `/users/view/${id}` },
          ]}
          size="max-w-7xl mx-auto pt-4"
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-3 border-blue-100 rounded-full animate-spin border-t-blue-600" />
            <p className="text-gray-500 text-sm">{t("common.loading")}</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <DynamicBreadcrumb
          items={[
            { label: t("user.title"), url: "/users" },
            { label: t("user.details.viewUser"), url: `/users/view/${id}` },
          ]}
          size="max-w-7xl mx-auto pt-4"
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-gray-600 font-medium">
              {t("user.messages.notFound")}
            </p>
          </div>
        </div>
      </>
    );
  }

  const userFullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    t("user.labels.notProvided");
  const userInitials = userFullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getProfileImageUrl = () => {
    if (!user.profileImage) return null;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "";
    return `${baseUrl}${user.profileImage}`;
  };


  return (
    <div className="bg-linear-to-br from-slate-50 via-white to-blue-50/20">
      <DynamicBreadcrumb
        items={[
          { label: t("user.title"), url: "/users" },
          { label: t("user.details.viewUser"), url: `/users/view/${id}` },
        ]}
        size="max-w-3xl mx-auto pt-2"
      />

      <div className="container mx-auto px-3 sm:px-4 max-w-3xl pt-2 pb-12">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Background */}
          <div className="relative h-28 sm:h-32 bg-linear-to-r from-blue-700 to-blue-800">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl translate-x-1/3 -translate-y-1/2" />
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-12 sm:-mt-14">
            <div className="relative">
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl()!}
                  alt={userFullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg object-cover bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ${
                  getProfileImageUrl() ? "hidden" : ""
                }`}
              >
                <span className="text-3xl font-bold text-white">
                  {userInitials}
                </span>
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center shadow-sm ${
                  user.enabled ? "bg-emerald-500" : "bg-gray-400"
                }`}
              >
                {user.enabled ? (
                  <CheckCircle2 className="h-3 w-3 text-white" />
                ) : (
                  <XCircle className="h-3 w-3 text-white" />
                )}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="text-center px-6 pt-4 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {userFullName}
            </h2>

            {/* Status & ID */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.active===true
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${user.enabled ? "bg-emerald-500" : "bg-gray-400"}`}
                />
                {user.enabled
                  ? t("user.status.active")
                  : t("user.status.inactive")}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">ID: {user.id}</span>
            </div>

            {/* Roles */}
            {user.roles && user.roles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {user.roles.map((role: any, index: number) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeColor(role?.name)}`}
                  >
                    <Shield className="h-3 w-3" />
                    {String(t(`role.${role?.name}`, role?.name))}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Details List */}
          <div className="px-4 sm:px-6 py-5">
            <div className="space-y-1">
              {/* Email */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    {t("user.details.email")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email || "-"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    {t("user.details.phoneNumber")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.phoneNumber || "-"}
                  </p>
                </div>
              </div>

    

              {/* Zone */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    {t("user.details.zone")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.zone?.name || t("user.labels.notAssigned")}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="h-5 w-5 text-teal-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    {t("user.details.createdDate")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.createdDate
                      ? IslamicDateFormatter.formatQamari(user.createdDate)
                      : "-"}
                  </p>
                  {user.createdDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(user.createdDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Updated Date */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="h-5 w-5 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    {t("user.details.updatedDate")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.updatedDate
                      ? IslamicDateFormatter.formatQamari(user.updatedDate)
                      : "-"}
                  </p>
                  {user.updatedDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(user.updatedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserDetails;
