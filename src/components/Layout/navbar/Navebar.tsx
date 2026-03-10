import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import "primeicons/primeicons.css";

export const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  // RTL support
  useEffect(() => {
    const dir =
      i18n.language === "ps" || i18n.language === "dr" ? "rtl" : "ltr";

    document.documentElement.dir = dir;
  }, [i18n.language]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  type LangOption = { label: string; value: "en" | "ps" | "dr"; icon: string };

  const languageOptions: LangOption[] = [
    { label: "English", value: "en", icon: "/us.png" },
    { label: "پښتو", value: "ps", icon: "/af.png" },
    { label: "دری", value: "dr", icon: "/af.png" },
  ];
  const handleLanguageChange = (e: any) => {
    const lang = e.value;
    console.log("Language changed to:", lang);
    i18n.changeLanguage(lang);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <i className="pi pi-bars text-gray-600 text-xl"></i>
            </button>

            <span className="text-gray-600 font-medium">
              {t("navbar.welcome")}
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                aria-label="User menu"
              >
                {/* Avatar with status indicator */}
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-100 transition-all duration-200">
                    {user?.profileImage ? (
                      <img
                        src={`http://localhost:8080${user.profileImage}`}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="bg-linear-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Online status indicator (optional) */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>

                {/* User info - hidden on mobile, visible on sm and up */}
                <div className="hidden sm:block text-left max-w-37.5">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.roles?.map((r: any) => r?.name).join(", ")}
                  </p>
                </div>

                {/* Chevron icon for dropdown indicator */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
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

              {/* Dropdown Menu - Mobile optimized */}
              {showUserMenu && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setShowUserMenu(false)}
                  />

                  {/* Menu panel */}
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                    {/* Mobile user info header */}
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
                            {user?.roles?.map((r: any) => r?.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <i className="pi pi-user text-blue-600 text-sm"></i>
                        </div>
                        <span className="text-sm text-gray-700">
                          {t("navbar.myProfile")}
                        </span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <i className="pi pi-cog text-purple-600 text-sm"></i>
                        </div>
                        <span className="text-sm text-gray-700">
                          {t("navbar.accountSettings")}
                        </span>
                      </Link>
                    </div>

                    {/* Logout button */}
                    <div className="p-3 border-t border-gray-100">
                      <Button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        label={t("navbar.logout")}
                        icon="pi pi-sign-out"
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-none justify-start gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Language Dropdown - Enhanced */}
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
                    className="w-5 h-5 rounded-sm "
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
                      className="w-5 h-5 rounded-sm "
                    />
                    <span className="hidden sm:inline text-sm">
                      {option.label}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Select language</span>
                )
              }
              className="w-12 sm:w-auto border-none hover:bg-gray-100 rounded-lg transition-colors"
              panelClassName="min-w-[120px]"
            />
          </div>

          {/* Add animation keyframes in your global CSS */}
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
