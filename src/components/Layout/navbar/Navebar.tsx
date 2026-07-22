import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import "primeicons/primeicons.css";
import { Badge } from "primereact/badge";
import { OverlayPanel } from "primereact/overlaypanel";
import NotificationService from "../../../services/notification.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import UserProfileMenuLinks from "../../feature/user/profile/UserProfileMenuLinks";
import {
  translateNotificationMessage,
  translateNotificationTitle,
} from "../../../utils/notificationTranslation";

const NOTIFICATION_EVENT = "notifications-updated";

type LangOption = {
  label: string;
  value: "en" | "ps" | "dr";
  icon: string;
};

type NotificationItem = {
  id: number;
  title?: string;
  message?: string;
  titleKey?: string;
  messageKey?: string;
  messageParams?: string | null;
  priority?: string;
  read?: boolean;
  isRead?: boolean;
  createdDate?: string | null;
  certificationRequestId?: number | null;
  certificationId?: number | null;
  actionUrl?: string | null;
};

type NavbarProps = {
  collapsed?: boolean;
  onMenuClick?: () => void;
};

export const Navbar = ({ collapsed = false }: NavbarProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationOverlayRef = useRef<OverlayPanel>(null);

  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const languageOptions: LangOption[] = useMemo(
    () => [
      { label: "English", value: "en", icon: "/us.png" },
      { label: "دری", value: "dr", icon: "/af.png" },
      { label: "پښتو", value: "ps", icon: "/af.png" },
    ],
    [t, i18n.language],
  );

  const translatedRoles =
    user?.roles?.map((r: any) => t(`role.${r?.name}`)).join(", ") || "";

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);

        const [countResponse, listResponse] = await Promise.all([
          NotificationService.getUnreadCount(),
          NotificationService.getMyNotificationsList(),
        ]);

        setUnreadCount(countResponse.data?.data?.unreadCount || 0);
        setNotifications((listResponse.data?.data || []).slice(0, 6));
      } catch {
        setUnreadCount(0);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();

    window.addEventListener(NOTIFICATION_EVENT, loadNotifications);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, loadNotifications);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dir =
      i18n.language === "ps" || i18n.language === "dr" ? "rtl" : "ltr";
  }, [i18n.language]);

  const isRTL = i18n.language === "ps" || i18n.language === "dr";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setShowUserMenu(false);
    navigate("/login");
  };

  const handleLanguageChange = (e: { value: LangOption["value"] }) => {
    void i18n.changeLanguage(e.value);
  };

  const getIsRead = (item: NotificationItem) =>
    Boolean(item.isRead ?? item.read);

  const resolveActionUrl = (item: NotificationItem) => {
    if (item.certificationRequestId) {
      return `/certification-request/view/${item.certificationRequestId}`;
    }

    if (item.actionUrl?.startsWith("/certification-requests/")) {
      const id = item.actionUrl.split("/").filter(Boolean).pop();
      return id ? `/certification-request/view/${id}` : null;
    }

    if (item.actionUrl?.startsWith("/certifications/")) {
      const id = item.actionUrl.split("/").filter(Boolean).pop();
      return id ? `/certification-details/${id}` : null;
    }

    if (item.certificationId) {
      return `/certification-details/${item.certificationId}`;
    }

    return "/notification";
  };

  const refreshNotifications = async () => {
    try {
      const [countResponse, listResponse] = await Promise.all([
        NotificationService.getUnreadCount(),
        NotificationService.getMyNotificationsList(),
      ]);

      setUnreadCount(countResponse.data?.data?.unreadCount || 0);
      setNotifications((listResponse.data?.data || []).slice(0, 6));
    } catch {
      setUnreadCount(0);
      setNotifications([]);
    }
  };

  const handleOpenNotification = async (item: NotificationItem) => {
    try {
      if (!getIsRead(item)) {
        await NotificationService.markAsRead(item.id);
      }
    } catch {
      // Keep navigation behavior even if mark-as-read fails.
    }

    notificationOverlayRef.current?.hide();
    await refreshNotifications();
    navigate(resolveActionUrl(item) || "/notification");
  };

  const handleOpenAllNotifications = () => {
    notificationOverlayRef.current?.hide();
    navigate("/notification");
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-3 py-2 sm:h-16 sm:py-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img
              src="/asqanew.png"
              alt="ASQA"
              className="h-9 w-12 shrink-0 object-contain sm:h-10 sm:w-14"
            />
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={`font-medium text-gray-600 ${
                  collapsed ? "hidden" : "hidden md:inline"
                }`}
              >
                {t("navbar.welcome")}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={(e) => notificationOverlayRef.current?.toggle(e)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100 sm:h-10 sm:w-10"
              aria-label={t("navbar.notifications")}
              title={t("navbar.notifications")}
            >
              <i
                className="pi pi-bell text-gray-700"
                style={{ fontSize: "1.25rem" }}
              />
              {unreadCount > 0 ? (
                <Badge
                  value={unreadCount > 99 ? "99+" : unreadCount}
                  severity="danger"
                  className="absolute -top-1 -right-1 min-w-[1.25rem] h-[1.1rem] text-[10px] flex items-center justify-center"
                />
              ) : null}
            </button>
            <OverlayPanel
              ref={notificationOverlayRef}
              dismissable
              className="w-[92vw] max-w-md"
            >
              <div dir={isRTL ? "rtl" : "ltr"} className="min-w-0">
                <div
                  className={`mb-3 flex items-center justify-between gap-3 border-b border-gray-100 pb-3 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {t("notification.title")}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t("notification.unreadSummary", { count: unreadCount })}
                    </p>
                  </div>
                  <Button
                    label={t("notification.open")}
                    text
                    className="p-0 text-sm"
                    onClick={handleOpenAllNotifications}
                  />
                </div>

                {notificationsLoading ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    <i className="pi pi-spin pi-spinner mr-2" />
                    {t("common.loading")}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    {t("notification.empty") || t("company.messages.noData")}
                  </div>
                ) : (
                  <div
                    className={`max-h-96 space-y-2 overflow-y-auto ${
                      isRTL ? "pl-1" : "pr-1"
                    }`}
                  >
                    {notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleOpenNotification(item)}
                        className={`w-full rounded-xl border p-3 transition-colors ${
                          isRTL ? "text-right" : "text-left"
                        } ${
                          getIsRead(item)
                            ? "border-gray-100 bg-white hover:bg-gray-50"
                            : "border-blue-100 bg-blue-50/70 hover:bg-blue-50"
                        }`}
                      >
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {translateNotificationTitle(item, t)}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                              {translateNotificationMessage(item, t)}
                            </p>
                          </div>
                          {!getIsRead(item) ? (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                          ) : null}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-[11px] uppercase tracking-wide text-gray-400">
                            {t(`notification.priorities.${item.priority || "INFO"}`)}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {item.createdDate
                              ? IslamicDateFormatter.formatQamari(
                                  item.createdDate,
                                  true,
                                )
                              : t("common.notSpecified")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </OverlayPanel>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="group flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-gray-100 sm:gap-3 sm:p-2"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-100 transition-all duration-200">
                    {user?.profileImage ? (
                      <img
                        src={`http://localhost:8080${user.profileImage}`}
                        alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="hidden text-left md:block max-w-37.5">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {translatedRoles}
                  </p>
                </div>

                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                  <div className="md:hidden p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                        {user?.profileImage ? (
                          <img
                            src={`http://localhost:8080${user.profileImage}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-medium">
                            {user?.firstName?.charAt(0)}
                            {user?.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {translatedRoles}
                        </p>
                      </div>
                    </div>
                  </div>

                  <UserProfileMenuLinks
                    onLinkClick={() => setShowUserMenu(false)}
                  />

                  <div className="p-3 border-t border-gray-100">
                    <Button
                      onClick={handleLogout}
                      label={t("navbar.logout")}
                      icon="pi pi-sign-out"
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-none justify-start gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            <Dropdown
              value={i18n.language}
              options={languageOptions}
              onChange={handleLanguageChange}
              optionLabel="label"
              optionValue="value"
              itemTemplate={(option: LangOption) => (
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <img
                    src={option.icon}
                    alt={option.label}
                    className="w-5 h-5 rounded-sm"
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              )}
              valueTemplate={(option: LangOption | null) =>
                option ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="w-5 h-5 rounded-sm"
                    />
                    <span className="hidden sm:inline text-sm">
                      {option.label}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Select language</span>
                )
              }
              className="w-11 shrink-0 rounded-lg border-0! shadow-none! transition-colors hover:bg-gray-100 sm:w-auto"
              panelClassName="min-w-[120px]"
            />
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out;
            }
          `}</style>
        </div>
      </div>
    </nav>
  );
};
