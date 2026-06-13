// components/Navbar.js
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, FileText, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // RTL support for Pashto and Dari
  useEffect(() => {
    const dir =
      i18n.language === "ps" || i18n.language === "dr" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
  }, [i18n.language]);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.services"), path: "/services" },
    { name: t("nav.internationalParties"), path: "/international-parties" },
    { name: t("nav.organizationServices"), path: "/organization-services" },
    { name: t("nav.companies"), path: "/companies" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  const languageOptions = [
    { label: "English", value: "en", icon: "🇺🇸" },
    { label: "پښتو", value: "ps", icon: "🇦🇫" },
    { label: "دری", value: "dr", icon: "🇦🇫" },
  ];

  const handleLanguageChange = (e: any) => {
    i18n.changeLanguage(e.value);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/98 shadow-xl backdrop-blur-md py-2 border-b border-gray-100"
          : "bg-linear-to-r from-slate-50 via-white to-slate-50/80 shadow-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section - Enhanced with gradient and modern styling */}
          <Link
            to="/"
            className="group flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all duration-300 hover:bg-linear-to-r hover:from-blue-50/50 hover:to-indigo-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="ASQA - Return to homepage"
          >
            {/* Clean, larger logo container */}
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50 hover:border-blue-200/50">
                <img
                  src="/asqanew.png"
                  alt="ASQA Logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>

            {/* Typography with refined spacing */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
                {t("common.asqa")}
              </span>
              <span className="text-xs font-medium text-gray-500 tracking-wide hidden sm:block">
                ( {t("common.asqaDescription")})
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Navigation Links with modern hover effects */}
            <div className="flex items-center gap-1 lg:gap-2 mr-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    location.pathname === link.path
                      ? "text-blue-700 bg-blue-50/80"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Language Dropdown - PrimeReact with custom styling */}
            <div className="mx-1">
              <Dropdown
                value={i18n.language}
                options={languageOptions}
                onChange={handleLanguageChange}
                optionLabel="label"
                optionValue="value"
                itemTemplate={(option) => (
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </div>
                )}
                valueTemplate={(option) =>
                  option ? (
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <span className="text-base">{option.icon}</span>
                      <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                        {option.label}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Language</span>
                  )
                }
                className="language-dropdown border-none"
                panelClassName="min-w-[140px] rounded-xl shadow-lg border border-gray-100 mt-2"
                appendTo="self"
              />
            </div>

            {/* CTA Button - Premium styling */}
            <Link
              to="/registration"
              className="ml-2 group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu - Modern slide-down with enhanced styling */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-2 space-y-1 border-t border-gray-100 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
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
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 ${
                      i18n.language === lang.value
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{lang.icon}</span>
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
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
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
