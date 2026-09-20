// components/Navbar.js
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, FileText, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // RTL support for Pashto and Dari
  useEffect(() => {
    const dir =
      i18n.language === "ps" || i18n.language === "dr" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
  }, [i18n.language]);

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

  const handleLanguageChange = (e: any) => {
    i18n.changeLanguage(e.value);
  };

  return (
    <nav
      dir={i18n.language === "ps" || i18n.language === "dr" ? "rtl" : "ltr"}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isOpen
          ? "bg-white shadow-md py-4"
          : "bg-white shadow-md py-4"
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
              <span className="whitespace-nowrap text-1xl font-medium text-gray-500 tracking-wide hidden sm:block">
                {t("common.asqaDescription")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 flex-nowrap items-center justify-start gap-1 px-1 lg:flex lg:gap-1 lg:px-2 xl:px-3">
            {/* Navigation Links with modern hover effects */}
            <div className="flex min-w-0 flex-nowrap items-center gap-0.5 lg:mr-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative whitespace-nowrap px-2 py-2 text-xs font-semibold rounded-lg transition-all duration-300 xl:px-3 xl:text-sm ${
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
            <div className="div"></div>
            {/* Language Dropdown - PrimeReact with custom styling */}
            <div className="mx-0.5 shrink-0">
              <Dropdown
                value={i18n.language}
                options={languageOptions}
                onChange={handleLanguageChange}
                optionLabel="label"
                optionValue="value"
                className="w-24 xl:w-28"
                panelClassName="w-28"
                itemTemplate={(option) => (
                  <div className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                    <img src={option.icon} alt={option.label} className="h-5 w-5 rounded-sm object-contain" />
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </div>
                )}
                appendTo="self"
              />
            </div>

            {/* CTA Button - Premium styling */}
            <Link
              to="/registration"
              className="ml-1 group relative shrink-0 whitespace-nowrap overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] xl:px-4 xl:text-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("nav.certicificationrequest")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Mobile Menu Button - Refined */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu - Modern slide-down with enhanced styling */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[calc(100vh-6rem)] overflow-y-auto opacity-100 mt-4" : "max-h-0 opacity-0"
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
              <div className="grid grid-cols-3 gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => changeLanguage(lang.value)}
                    className={`flex flex-col items-center gap-1 whitespace-nowrap py-2 rounded-xl transition-all duration-200 ${
                      i18n.language === lang.value
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <img src={lang.icon} alt={lang.label} className="h-6 w-6 rounded-sm object-contain" />
                    <span className="text-xs font-medium">{lang.label}</span>
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
