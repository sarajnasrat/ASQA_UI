// components/Navbar.js
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // RTL support for Pashto and Dari
  useEffect(() => {
    const dir =
      i18n.language === "ps" || i18n.language === "dr" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.services"), path: "/services" },
      { name: t("nav.organizationServices"), path: "/organization-services" },
          { name: t("nav.certificationVerification"), path: "/certification-verification" },
    { name: t("nav.internationalParties"), path: "/international-parties" },
  
    { name: t("nav.companies"), path: "/companies" },
    { name: t("nav.blacklistedCompanies"), path: "/blacklisted-companies" },
    { name: t("nav.contact"), path: "/contact" },
  
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  const languageOptions = [
    { label: "English", value: "en", icon: "/us.png" },
    { label: "پښتو", value: "ps", icon: "/af.png" },
    { label: "دری", value: "dr", icon: "/af.png" },
  ];

  return (
    <nav
      dir={i18n.language === "ps" || i18n.language === "dr" ? "rtl" : "ltr"}
      className={`fixed top-0 left-0 w-full z-50 border-b border-blue-200 bg-linear-to-r from-blue-50 via-white to-indigo-50 shadow-sm transition-all duration-500 ${
        isOpen
          ? "py-4"
          : "py-4"
      }`}
    >
      <div className="w-full px-3 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section - Enhanced with gradient and modern styling */}
          <Link
            to="/"
            className="group flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-linear-to-r hover:from-blue-50/50 hover:to-indigo-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="ASQA - Return to homepage"
          >
            {/* Clean, larger logo container */}
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-12 overflow-hidden  hover:border-blue-200/50">
                <img
                  src="/asqanew.png"
                  alt="ASQA Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Typography with refined spacing */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
                {/* {t("common.asqa")} */}
              </span>
              <span className="hidden whitespace-nowrap text-sm font-medium tracking-wide text-gray-500 2xl:block 2xl:text-base">
                {t("common.asqaDescription")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 flex-nowrap items-center justify-end gap-1 px-1 xl:flex xl:gap-1 2xl:px-2">
            {/* Navigation Links with modern hover effects */}
            <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max flex-nowrap items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                    className={`relative whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium leading-5 transition-all duration-300 2xl:px-2.5 2xl:text-base ${
                    location.pathname === link.path
                      ? "text-blue-700 bg-blue-50/80"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}
              </div>
            </div>
                 {/* CTA Button - Premium styling */}
            <Link
              to="/registration"
              className="group relative ml-1 shrink-0 whitespace-nowrap overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-xs font-medium leading-5 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] 2xl:px-4 2xl:text-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("nav.certicificationrequest")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <div className="div"></div>
            {/* Language buttons: show only the two languages that are not active. */}
            <div className="mx-2 flex shrink-0 items-center gap-1">
              {languageOptions
                .filter((lang) => lang.value !== i18n.language)
                .map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => changeLanguage(lang.value)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-base font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    title={lang.label}
                  >
                    <img src={lang.icon} alt="" className="h-4 w-4 rounded-sm object-contain" />
                    <span>{lang.label}</span>
                  </button>
                ))}
            </div>

       
          </div>

          {/* Mobile Menu Button - Refined */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 xl:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="website-mobile-menu"
            type="button"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu - Modern slide-down with enhanced styling */}
        <div
          id="website-mobile-menu"
          className={`overflow-hidden transition-all duration-300 ease-in-out xl:hidden ${
            isOpen ? "max-h-[70vh] overflow-y-auto opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 border-t border-gray-100 bg-white px-2 py-2 pt-4 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block whitespace-nowrap px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Language Selector - Improved */}
            <div className="px-1 pt-4 pb-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
                Language
              </p>
              <div className="grid grid-cols-2 gap-2">
                {languageOptions.filter((lang) => lang.value !== i18n.language).map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => changeLanguage(lang.value)}
                    className="flex flex-col items-center gap-1 whitespace-nowrap rounded-xl bg-gray-50 py-2 text-gray-600 transition-all duration-200 hover:bg-gray-100"
                  >
                    <img src={lang.icon} alt={lang.label} className="h-6 w-6 rounded-sm object-contain" />
                    <span className="text-sm font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile CTA Button */}
            <div className="pt-2 pb-1 px-1">
              <Link
                to="/registration"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg sm:px-4"
              >
                <FileText className="w-4 h-4" />
                {t("nav.certicificationrequest")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for PrimeReact Dropdown Overrides */}
      <style>{`
        .language-dropdown .p-dropdown {
          background: transparent;
          border: none;
          border-radius: 0.75rem;
          padding: 0.25rem 0.5rem;
          transition: all 0.2s;
        }
        .language-dropdown .p-dropdown:hover {
          background: rgba(59, 130, 246, 0.05);
        }
        .language-dropdown .p-dropdown:focus {
          box-shadow: none;
          border-color: transparent;
        }
        .language-dropdown .p-dropdown .p-dropdown-trigger {
          width: 1.5rem;
        }
        .language-dropdown .p-dropdown-panel {
          margin-top: 0.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
        }
        @media (max-width: 768px) {
          .language-dropdown .p-dropdown .p-dropdown-label {
            padding-left: 0;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
