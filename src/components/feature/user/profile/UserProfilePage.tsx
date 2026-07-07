import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../../common/DynamicBreadcrumb";
import UserService from "../../../../services/user.service";
import { IslamicDateFormatter } from "../../../common/datepicker/IslamicDateFormatter";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const getStoredUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
};

export const UserProfilePage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userId = getStoredUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await UserService.getUser(Number(userId));
        setUser(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return <div className="p-4">{t("common.loading")}</div>;
  }

  if (!user) {
    return <div className="p-4">{t("user.messages.notFound")}</div>;
  }

  const userFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const userInitials = userFullName
    ? userFullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";
  const isActive = Boolean(user.active ?? user.enabled);

  const getProfileImageUrl = () => {
    if (!user.profileImage) return null;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.REACT_APP_API_BASE_URL ||
      "http://localhost:8080";
    return `${baseUrl}${user.profileImage}`;
  };

  return (
    <div className="bg-linear-to-br from-slate-50 via-white to-blue-50/20">
      <DynamicBreadcrumb
        items={[{ label: t("navbar.myProfile"), url: "/profile" }]}
        size="max-w-3xl mx-auto pt-2"
      />

      <div className="container mx-auto max-w-3xl px-3 pb-12 pt-2">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="relative h-28 bg-linear-to-r from-blue-700 to-blue-800 sm:h-32" />

          <div className="flex justify-center -mt-12 sm:-mt-14">
            <div className="relative">
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl()!}
                  alt={userFullName}
                  className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-28 sm:w-28">
                  <span className="text-3xl font-bold text-white">
                    {userInitials}
                  </span>
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-3 border-white shadow-sm ${isActive ? "bg-emerald-500" : "bg-gray-400"}`}
              >
                {isActive ? (
                  <CheckCircle2 className="h-3 w-3 text-white" />
                ) : (
                  <XCircle className="h-3 w-3 text-white" />
                )}
              </span>
            </div>
          </div>

          <div className="px-6 pb-4 pt-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {userFullName || t("user.labels.notProvided")}
            </h2>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
              <span>ID: {user.id}</span>
              <span>•</span>
              <span>{isActive ? t("user.status.active") : t("user.status.inactive")}</span>
              <span>•</span>
              <span>{user.email || "-"}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 px-4 py-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    {t("user.details.email")}
                  </p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    {t("user.details.phoneNumber")}
                  </p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.phoneNumber || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    {t("user.details.zone")}
                  </p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.zone?.name || t("user.labels.notAssigned")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100">
                  <Calendar className="h-5 w-5 text-teal-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    {t("user.details.createdDate")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.createdDate
                      ? IslamicDateFormatter.formatQamari(user.createdDate)
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100">
                  <Clock className="h-5 w-5 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    {t("user.details.updatedDate")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.updatedDate
                      ? IslamicDateFormatter.formatQamari(user.updatedDate)
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
