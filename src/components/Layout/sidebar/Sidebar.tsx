import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "primeicons/primeicons.css";

const themes = {
  modernBlue: {
    id: "modernBlue",
    name: "Modern Blue",
    sidebarBg: "bg-white",
    headerBg: "from-blue-600 to-blue-700",
    headerText: "text-white",
    headerSubtext: "text-blue-100",
    itemHover: "hover:bg-blue-50",
    itemActive: "bg-blue-50",
    textDefault: "text-gray-700",
    textHover: "text-gray-900",
    textActive: "text-blue-700",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-blue-600",
    border: "border-gray-200",
    accent: "bg-blue-600",
  },
  darkSlate: {
    id: "darkSlate",
    name: "Dark Slate",
    sidebarBg: "bg-slate-900",
    headerBg: "from-slate-800 to-slate-900",
    headerText: "text-white",
    headerSubtext: "text-slate-300",
    itemHover: "hover:bg-slate-800",
    itemActive: "bg-slate-800",
    textDefault: "text-slate-300",
    textHover: "text-white",
    textActive: "text-indigo-300",
    iconDefault: "text-slate-500",
    iconHover: "text-slate-300",
    iconActive: "text-indigo-300",
    border: "border-slate-800",
    accent: "bg-indigo-500",
  },
  emeraldGreen: {
    id: "emeraldGreen",
    name: "Emerald Green",
    sidebarBg: "bg-white",
    headerBg: "from-emerald-600 to-teal-700",
    headerText: "text-white",
    headerSubtext: "text-emerald-100",
    itemHover: "hover:bg-emerald-50",
    itemActive: "bg-emerald-50",
    textDefault: "text-gray-700",
    textHover: "text-gray-900",
    textActive: "text-emerald-700",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-emerald-600",
    border: "border-gray-200",
    accent: "bg-emerald-600",
  },
  purpleIndigo: {
    id: "purpleIndigo",
    name: "Purple Indigo",
    sidebarBg: "bg-white",
    headerBg: "from-purple-600 to-indigo-700",
    headerText: "text-white",
    headerSubtext: "text-purple-100",
    itemHover: "hover:bg-purple-50",
    itemActive: "bg-purple-50",
    textDefault: "text-gray-700",
    textHover: "text-gray-900",
    textActive: "text-purple-700",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-purple-600",
    border: "border-gray-200",
    accent: "bg-purple-600",
  },
  lightMinimal: {
    id: "lightMinimal",
    name: "Light Minimal",
    sidebarBg: "bg-gray-50",
    headerBg: "from-gray-100 to-gray-200",
    headerText: "text-gray-800",
    headerSubtext: "text-gray-500",
    itemHover: "hover:bg-gray-100",
    itemActive: "bg-white",
    textDefault: "text-gray-600",
    textHover: "text-gray-900",
    textActive: "text-gray-900",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-gray-800",
    border: "border-gray-200",
    accent: "bg-gray-800",
  },
} as const;

type ThemeKey = keyof typeof themes;

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export const Sidebar = ({
  collapsed,
  onCollapsedChange,
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("modernBlue");
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const theme = themes[currentTheme];
  const isRTL = i18n.language === "ps" || i18n.language === "dr";

  useEffect(() => {
    const storedMenus = JSON.parse(localStorage.getItem("menus") || "[]");
    setMenuItems(storedMenus);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (collapsed) {
      setShowThemeSelector(false);
    }
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        setShowThemeSelector(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const getAccentColor = useMemo(() => {
    switch (currentTheme) {
      case "darkSlate":
        return "#6366f1";
      case "emeraldGreen":
        return "#059669";
      case "purpleIndigo":
        return "#7c3aed";
      case "lightMinimal":
        return "#1f2937";
      default:
        return "#2563eb";
    }
  }, [currentTheme]);

  const getLabel = (item: any) => {
    switch (i18n.language) {
      case "ps":
        return item.labelPs || item.labelDr || item.labelEn;
      case "dr":
        return item.labelDr || item.labelPs || item.labelEn;
      default:
        return item.labelEn || item.labelDr || item.labelPs;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleSubmenu = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMenuItemClick = (item: any) => {
    if (item.children?.length) {
      toggleSubmenu(item.id);
      return;
    }

    navigate(item.path);
  };

  const renderChildren = (children: any[], level = 1) =>
    children.map((child) => {
      const childActive = isActive(child.path);
      const hasGrandChildren = child.children && child.children.length > 0;
      const isExpanded = expandedItems.has(child.id);
      const isHovered = hoveredItem === child.id;

      return (
        <div key={child.id} className="relative">
          <Link
            to={child.path}
            className="group relative block rounded-xl outline-none"
            onClick={(e) => {
              if (hasGrandChildren) {
                e.preventDefault();
                toggleSubmenu(child.id);
              }
            }}
            onMouseEnter={() => setHoveredItem(child.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div
              className={`absolute inset-0 rounded-xl transition-all duration-200 ${
                childActive
                  ? `${theme.itemActive} shadow-sm`
                  : isHovered
                    ? theme.itemHover
                    : "bg-transparent"
              }`}
            />

            <div className="relative flex min-h-10 items-center gap-3 px-3 py-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {child.icon ? (
                  <i
                    className={`${child.icon} text-sm transition-colors duration-200 ${
                      childActive
                        ? theme.iconActive
                        : isHovered
                          ? theme.iconHover
                          : theme.iconDefault
                    }`}
                  />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                      childActive
                        ? "scale-125 opacity-100"
                        : isHovered
                          ? "scale-110 opacity-80"
                          : "opacity-50"
                    } ${
                      childActive
                        ? theme.accent
                        : currentTheme === "darkSlate"
                          ? "bg-slate-500"
                          : "bg-gray-300"
                    }`}
                  />
                )}
              </div>

              {!collapsed && (
                <>
                  <span
                    className={`min-w-0 flex-1 truncate text-[0.8125rem] font-medium transition-colors duration-200 ${
                      childActive
                        ? theme.textActive
                        : isHovered
                          ? theme.textHover
                          : theme.textDefault
                    }`}
                  >
                    {getLabel(child)}
                  </span>

                  {hasGrandChildren && (
                    <i
                      className={`pi pi-chevron-down shrink-0 text-[0.6875rem] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      } ${
                        childActive || isExpanded
                          ? theme.iconActive
                          : theme.iconDefault
                      }`}
                    />
                  )}
                </>
              )}
            </div>

            {childActive && !collapsed && (
              <div
                className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                style={{
                  backgroundColor: getAccentColor,
                  [isRTL ? "right" : "left"]: 0,
                }}
              />
            )}
          </Link>

          {hasGrandChildren && !collapsed && (
            <div
              className={`grid transition-all duration-300 ease-out ${
                isExpanded
                  ? "mt-1 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`flex flex-col gap-0.5 ${
                    isRTL ? "mr-4 border-r pr-3" : "ml-4 border-l pl-3"
                  }`}
                  style={{
                    borderColor:
                      currentTheme === "darkSlate"
                        ? "rgb(51 65 85 / 0.7)"
                        : "rgb(229 231 235 / 0.9)",
                  }}
                >
                  {renderChildren(child.children, level + 1)}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });

  const renderMenuItem = (item: any) => {
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id} className={`${collapsed ? "px-2 pb-2" : "px-3 pb-1"}`}>
        <div
          className={`group relative flex cursor-pointer items-center rounded-xl transition-all duration-200 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          onClick={() => handleMenuItemClick(item)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMenuItemClick(item);
            }
          }}
        >
          <div
            className={`absolute inset-0 rounded-xl transition-all duration-200 ${
              active
                ? `${theme.itemActive} shadow-sm`
                : isHovered
                  ? theme.itemHover
                  : "bg-transparent"
            }`}
          />

          <div
            className={`relative flex min-h-11 w-full items-center ${
              collapsed ? "justify-center px-2" : "justify-between px-3"
            }`}
          >
            <div
              className={`flex min-w-0 items-center gap-3 ${
                collapsed ? "justify-center gap-0" : ""
              }`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                <i
                  className={`${item.icon} text-base transition-colors duration-200 ${
                    active
                      ? theme.iconActive
                      : isHovered
                        ? theme.iconHover
                        : theme.iconDefault
                  }`}
                />
              </div>

              {!collapsed && (
                <span
                  className={`truncate text-[0.875rem] font-semibold transition-colors duration-200 ${
                    active
                      ? theme.textActive
                      : isHovered
                        ? theme.textHover
                        : theme.textDefault
                  }`}
                >
                  {getLabel(item)}
                </span>
              )}
            </div>

            {hasChildren && !collapsed && (
              <i
                className={`pi pi-chevron-down shrink-0 text-[0.75rem] transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                } ${active || isExpanded ? theme.iconActive : theme.iconDefault}`}
              />
            )}
          </div>

          {active && !collapsed && (
            <div
              className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: getAccentColor,
                [isRTL ? "right" : "left"]: 0,
              }}
            />
          )}
        </div>

        {hasChildren && (
          <div
            className={`grid transition-all duration-300 ease-out ${
              isExpanded
                ? "mt-1 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className={collapsed ? "px-1 pt-2" : ""}>
                <div
                  className={
                    collapsed
                      ? `flex flex-col items-center gap-2 ${
                          isRTL ? "mr-2 border-r pr-2" : "ml-2 border-l pl-2"
                        }`
                      : `flex flex-col gap-0.5 ${
                          isRTL ? "mr-5 border-r pr-3" : "ml-5 border-l pl-3"
                        }`
                  }
                  style={{
                    borderColor:
                      currentTheme === "darkSlate"
                        ? "rgb(51 65 85 / 0.7)"
                        : "rgb(229 231 235 / 0.9)",
                  }}
                >
                  {renderChildren(item.children)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleButtonSideClass = isRTL ? "left-6" : "right-6";
  const sidebarTranslateClass = isMobileOpen
    ? "translate-x-0"
    : isRTL
      ? "translate-x-full lg:translate-x-0"
      : "-translate-x-full lg:translate-x-0";

  return (
    <>
      <button
        onClick={() => setIsMobileOpen((prev) => !prev)}
        className={`fixed bottom-6 ${toggleButtonSideClass} z-50 rounded-2xl p-3.5 text-white shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden`}
        style={{ backgroundColor: getAccentColor }}
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        <i
          className={`pi ${isMobileOpen ? "pi-times" : "pi-bars"}`}
          style={{ fontSize: "1.1rem" }}
        />
      </button>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed top-0 z-40 flex h-screen flex-col border-r shadow-2xl transition-all duration-300 ease-out lg:sticky lg:shadow-lg ${
          theme.sidebarBg
        } ${theme.border} ${collapsed ? "w-20" : "w-72"} ${sidebarTranslateClass}`}
        style={{ [isRTL ? "right" : "left"]: 0 }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className={`relative shrink-0 overflow-hidden bg-gradient-to-r ${theme.headerBg}`}>
          <div className="absolute inset-0 bg-black/5" />
          <div className="relative px-4 py-4">
            {!collapsed ? (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className={`${theme.headerText} truncate text-lg font-bold tracking-tight`}>
                    {t("common.systme")}
                  </h1>
                  <p className={`${theme.headerSubtext} mt-0.5 text-xs font-semibold uppercase tracking-[0.18em]`}>
                    {t("common.name")}
                  </p>
                </div>

                <button
                  onClick={() => onCollapsedChange(true)}
                  className="rounded-lg bg-white/10 p-2 text-white/85 transition-colors duration-200 hover:bg-white/20"
                  aria-label="Collapse sidebar"
                >
                  <i className={`pi ${isRTL ? "pi-angle-right" : "pi-angle-left"} text-sm`} />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => onCollapsedChange(false)}
                  className="rounded-lg bg-white/10 p-2 text-white/85 transition-colors duration-200 hover:bg-white/20"
                  aria-label="Expand sidebar"
                >
                  <i className={`pi ${isRTL ? "pi-angle-left" : "pi-angle-right"} text-sm`} />
                </button>
              </div>
            )}
          </div>
        </div>

        <nav
          className="scrollbar-thin flex-1 overflow-y-auto py-4"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {menuItems.length > 0 ? (
              <div className="space-y-1">{menuItems.map((item) => renderMenuItem(item))}</div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
                <i className={`pi pi-menu mb-3 text-3xl ${theme.iconDefault}`} />
                <p className={`text-sm font-medium ${theme.textDefault}`}>
                  No menu items loaded
                </p>
                <p className="mt-1 text-xs text-gray-400">Check back later</p>
              </div>
            )}
          </div>
        </nav>

        <div className={`relative shrink-0 border-t p-4 ${theme.border}`}>
          {!collapsed ? (
            <div className="space-y-3">
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector((prev) => !prev)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors duration-200 ${theme.itemHover}`}
                  aria-label="Change theme"
                >
                  <div className="flex items-center gap-2">
                    <i className={`pi pi-palette text-sm ${theme.iconDefault}`} />
                    <span className={`text-sm font-medium ${theme.textDefault}`}>
                      {theme.name}
                    </span>
                  </div>
                  <i
                    className={`pi pi-chevron-down text-xs transition-transform duration-200 ${
                      showThemeSelector ? "rotate-180" : ""
                    } ${theme.iconDefault}`}
                  />
                </button>

                {showThemeSelector && (
                  <div
                    className={`absolute bottom-full z-50 mb-2 min-w-[170px] rounded-xl border bg-white p-2 shadow-xl ${
                      theme.border
                    } ${isRTL ? "right-0" : "left-0"}`}
                  >
                    {(Object.keys(themes) as ThemeKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setCurrentTheme(key);
                          setShowThemeSelector(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 ${
                          currentTheme === key
                            ? "bg-gray-100 font-semibold text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              key === "darkSlate"
                                ? "#6366f1"
                                : key === "emeraldGreen"
                                  ? "#059669"
                                  : key === "purpleIndigo"
                                    ? "#7c3aed"
                                    : key === "lightMinimal"
                                      ? "#1f2937"
                                      : "#2563eb",
                          }}
                        />
                        <span>{themes[key].name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-1 text-center">
                <p className="text-[0.6875rem] font-medium text-gray-400">
                  © 2026 ASQA System
                </p>
                <p className="mt-0.5 text-[0.625rem] text-gray-300">v2.0.0</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => onCollapsedChange(false)}
                className={`rounded-lg p-2 transition-colors duration-200 ${theme.itemHover}`}
                aria-label="Expand sidebar"
              >
                <i className={`pi pi-palette text-sm ${theme.iconDefault}`} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        [dir="rtl"] .animate-slide-in {
          animation: slideInRTL 0.3s ease-out;
        }
        @keyframes slideInRTL {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};
