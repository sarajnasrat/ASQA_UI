// components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Building2, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
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
    { name: t("nav.companies"), path: "/companies" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg py-2"
          : "bg-white/95 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50/80 active:bg-gray-100 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="ASQA - Return to homepage"
          >
            {/* Simplified logo container */}
            <div className="flex items-center justify-center w-32 h-14">
              <img
                src="/aqsa.jpg"
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
            </div>

            {/* Clean, simple text */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                ASQA
              </span>
              <span className="hidden sm:inline-block text-xs font-normal text-gray-500">
                Afghanistan Quality Standards Authority
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold transition-colors hover:text-blue-600 ${
                  location.pathname === link.path
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  showLanguageMenu
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                <Globe
                  size={18}
                  className={`transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""}`}
                />
                <span className="text-sm font-medium">
                  {i18n.language === "en"
                    ? "English"
                    : i18n.language === "ps"
                      ? "پښتو"
                      : "دری"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""}`}
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

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fadeIn">
                  {/* English Option */}
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`w-full flex items-center px-4 py-3 text-sm transition-all duration-200 ${
                      i18n.language === "en"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <span className="flex-1 text-left">🇬🇧 English</span>
                    {i18n.language === "en" && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Pashto Option */}
                  <button
                    onClick={() => changeLanguage("ps")}
                    className={`w-full flex items-center px-4 py-3 text-sm transition-all duration-200 ${
                      i18n.language === "ps"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <span className="flex-1 text-left">🇦🇫 پښتو</span>
                    {i18n.language === "ps" && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Dari Option */}
                  <button
                    onClick={() => changeLanguage("dr")}
                    className={`w-full flex items-center px-4 py-3 text-sm transition-all duration-200 ${
                      i18n.language === "dr"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <span className="flex-1 text-left">🇦🇫 دری</span>
                    {i18n.language === "dr" && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Decorative bottom gradient */}
                  <div className="h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-b-xl"></div>
                </div>
              )}
            </div>

            <Link
              to="/certification/select-type"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("nav.certicificationrequest")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  location.pathname === link.path
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Language Options */}
            <div className="py-2 border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={() => {
                  changeLanguage("en");
                  setIsOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                English
              </button>
              <button
                onClick={() => {
                  changeLanguage("ps");
                  setIsOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                پښتو
              </button>
              <button
                onClick={() => {
                  changeLanguage("dr");
                  setIsOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                دری
              </button>
            </div>

            <Link
              to="/registration"
              onClick={() => setIsOpen(false)}
              className="block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              Register Company
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
