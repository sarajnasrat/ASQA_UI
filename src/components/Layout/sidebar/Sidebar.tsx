import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "primeicons/primeicons.css";

// ============================================
// 5 PROFESSIONAL COLOR THEMES
// ============================================
const themes = {
  modernBlue: {
    id: "modernBlue",
    name: "Modern Blue",
    sidebarBg: "bg-white",
    sidebarBgGradient: "from-blue-600 to-blue-700",
    headerBg: "bg-gradient-to-r from-blue-600 to-blue-700",
    headerText: "text-white",
    headerSubtext: "text-blue-100",
    itemBg: "bg-white",
    itemHover: "hover:bg-blue-50",
    itemActive: "bg-blue-50",
    itemActiveBorder: "bg-blue-600",
    textDefault: "text-gray-700",
    textHover: "text-gray-900",
    textActive: "text-blue-700",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-blue-600",
    border: "border-gray-200",
    divider: "bg-gray-200",
    accent: "bg-blue-600",
    accentLight: "bg-blue-50",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  darkSlate: {
    id: "darkSlate",
    name: "Dark Slate",
    sidebarBg: "bg-slate-900",
    sidebarBgGradient: "from-slate-800 to-slate-900",
    headerBg: "bg-gradient-to-r from-slate-800 to-slate-900",
    headerText: "text-white",
    headerSubtext: "text-slate-300",
    itemBg: "bg-slate-900",
    itemHover: "hover:bg-slate-800",
    itemActive: "bg-slate-800",
    itemActiveBorder: "bg-indigo-500",
    textDefault: "text-slate-300",
    textHover: "text-white",
    textActive: "text-indigo-400",
    iconDefault: "text-slate-500",
    iconHover: "text-slate-300",
    iconActive: "text-indigo-400",
    border: "border-slate-800",
    divider: "bg-slate-800",
    accent: "bg-indigo-500",
    accentLight: "bg-slate-800",
    badgeBg: "bg-slate-800",
    badgeText: "text-slate-300",
  },
  emeraldGreen: {
    id: "emeraldGreen",
    name: "Emerald Green",
    sidebarBg: "bg-white",
    sidebarBgGradient: "from-emerald-600 to-teal-700",
    headerBg: "bg-gradient-to-r from-emerald-600 to-teal-700",
    headerText: "text-white",
    headerSubtext: "text-emerald-100",
    itemBg: "bg-white",
    itemHover: "hover:bg-emerald-50",
    itemActive: "bg-emerald-50",
    itemActiveBorder: "bg-emerald-600",
    textDefault: "text-gray-700",
    textHover: "text-gray-900",
    textActive: "text-emerald-700",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-emerald-600",
    border: "border-gray-200",
    divider: "bg-gray-200",
    accent: "bg-emerald-600",
    accentLight: "bg-emerald-50",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  purpleIndigo: {
    id: "purpleIndigo",
    name: "Purple Indigo",
    sidebarBg: "bg-white",
    sidebarBgGradient: "from-purple-600 to-indigo-700",
    headerBg: "bg-gradient-to-r from-purple-600 to-indigo-700",
    headerText: "text-white",
    headerSubtext: "text-purple-100",
    itemBg: "bg-white",
    itemHover: "hover:bg-purple-50",
    itemActive: "bg-purple-50",
    itemActiveBorder: "bg-purple-600",
    textDefault: "text-gray-700",
    textHover: "text-gray-900",
    textActive: "text-purple-700",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-purple-600",
    border: "border-gray-200",
    divider: "bg-gray-200",
    accent: "bg-purple-600",
    accentLight: "bg-purple-50",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
  },
  lightMinimal: {
    id: "lightMinimal",
    name: "Light Minimal",
    sidebarBg: "bg-gray-50",
    sidebarBgGradient: "from-gray-100 to-gray-200",
    headerBg: "bg-gradient-to-r from-gray-100 to-gray-200",
    headerText: "text-gray-800",
    headerSubtext: "text-gray-500",
    itemBg: "bg-gray-50",
    itemHover: "hover:bg-gray-100",
    itemActive: "bg-white",
    itemActiveBorder: "bg-gray-800",
    textDefault: "text-gray-600",
    textHover: "text-gray-900",
    textActive: "text-gray-900",
    iconDefault: "text-gray-400",
    iconHover: "text-gray-600",
    iconActive: "text-gray-800",
    border: "border-gray-200",
    divider: "bg-gray-200",
    accent: "bg-gray-800",
    accentLight: "bg-gray-100",
    badgeBg: "bg-gray-200",
    badgeText: "text-gray-700",
  },
};

type ThemeKey = keyof typeof themes;

// ============================================
// MAIN SIDEBAR COMPONENT
// ============================================
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

  // State management
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("modernBlue");
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const theme = themes[currentTheme];
  const isRTL = i18n.language === "ps" || i18n.language === "dr";

  // Load menu items from localStorage
  useEffect(() => {
    const storedMenus = JSON.parse(localStorage.getItem("menus") || "[]");
    setMenuItems(storedMenus);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => setIsMobileOpen(false), [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle submenu expansion
  const toggleSubmenu = (id: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Check if a path is active
  const isActive = (path: string) => location.pathname === path;

  // Handle menu item click
  const handleMenuItemClick = (item: any) => {
    if (!item.children?.length) {
      navigate(item.path);
    } else {
      toggleSubmenu(item.id);
    }
  };

  // Get localized label
  const getLabel = (item: any) => {
    const lang = i18n.language;
    switch (lang) {
      case "ps":
        return item.labelPs || item.labelEn;
      case "dr":
        return item.labelDr || item.labelEn;
      default:
        return item.labelEn;
    }
  };

  // Render child menu items recursively
  const renderChildren = (children: any[], depth: number = 1) => {
    return children.map((child) => {
      const childActive = isActive(child.path);
      const hasGrandChildren = child.children && child.children.length > 0;
      const isExpanded = expandedItems.has(child.id);
      const isChildHovered = hoveredItem === child.id;

      return (
        <div key={child.id} className="relative">
          <Link
            to={child.path}
            className="group relative block outline-none focus:outline-none"
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
              className={`absolute inset-x-0 rounded-lg transition-all duration-200
                ${
                  childActive
                    ? `${theme.itemActive} shadow-sm`
                    : isChildHovered
                      ? `${theme.itemHover} scale-[1.02]`
                      : "bg-transparent"
                }`}
              style={{ height: "calc(100% - 2px)", top: "1px" }}
            />

            <div
              className={`relative flex items-center gap-3 px-3 py-2 transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              }`}
              style={{
                [isRTL ? "paddingRight" : "paddingLeft"]: collapsed
                  ? "0"
                  : undefined,
              }}
            >
              <div className="flex items-center justify-center shrink-0">
                {child.icon ? (
                  <i
                    className={`${child.icon} transition-all duration-200 text-sm`}
                    style={{
                      color: childActive
                        ? theme.iconActive.split(" ")[1]
                        : isChildHovered
                          ? theme.iconHover.split(" ")[1]
                          : theme.iconDefault.split(" ")[1],
                    }}
                  />
                ) : (
                  <div
                    className={`rounded-full transition-all duration-300 w-1.5 h-1.5 ${
                      childActive
                        ? "bg-current scale-150"
                        : isChildHovered
                          ? "bg-current scale-125 opacity-60"
                          : "bg-gray-300"
                    }`}
                    style={{ color: theme.accent.split(" ")[1] }}
                  />
                )}
              </div>

              {!collapsed && (
                <span
                  className={`flex-1 text-[0.8125rem] font-medium transition-all duration-200 ${
                    childActive
                      ? theme.textActive
                      : isChildHovered
                        ? theme.textHover
                        : theme.textDefault
                  }`}
                >
                  {getLabel(child)}
                </span>
              )}

              {hasGrandChildren && !collapsed && (
                <i
                  className={`pi pi-chevron-down transition-all duration-300 text-[0.6875rem] shrink-0 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  style={{
                    color: isExpanded
                      ? theme.accent.split(" ")[1]
                      : theme.iconDefault.split(" ")[1],
                    [isRTL ? "marginLeft" : "marginRight"]: "0",
                  }}
                />
              )}
            </div>

            {childActive && !collapsed && (
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full`}
                style={{
                  backgroundColor: theme.accent.split(" ")[1],
                  [isRTL ? "right" : "left"]: 0,
                }}
              />
            )}
          </Link>

          {hasGrandChildren && (
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isExpanded
                  ? "grid-rows-[1fr] opacity-100 mt-1"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`flex flex-col gap-0.5 ${
                    isRTL ? "mr-4 pr-3 border-r" : "ml-4 pl-3 border-l"
                  }`}
                  style={{ borderColor: theme.border.split(" ")[1] }}
                >
                  {renderChildren(child.children, depth + 1)}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  // Render main menu item
  const renderMenuItem = (item: any) => {
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id} className="px-2 mb-1">
        <div
          className={`group relative flex items-center w-full cursor-pointer transition-all duration-200 rounded-xl outline-none focus:outline-none ${
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
            className={`absolute inset-0 rounded-xl transition-all duration-200
              ${
                active
                  ? `${theme.itemActive}`
                  : isHovered
                    ? `${theme.itemHover} scale-[1.02]`
                    : "bg-transparent"
              }`}
          />

          <div
            className={`relative flex items-center w-full px-3 py-2.5 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div
              className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
            >
              <i
                className={`${item.icon} transition-all duration-200 text-base shrink-0`}
                style={{
                  color: active
                    ? theme.iconActive.split(" ")[1]
                    : isHovered
                      ? theme.iconHover.split(" ")[1]
                      : theme.iconDefault.split(" ")[1],
                }}
              />

              {!collapsed && (
                <span
                  className={`text-[0.875rem] font-semibold transition-all duration-200 ${
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
                className={`pi pi-chevron-down transition-all duration-300 text-[0.75rem] shrink-0 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                style={{
                  color: isExpanded
                    ? theme.accent.split(" ")[1]
                    : theme.iconDefault.split(" ")[1],
                }}
              />
            )}
          </div>

          {active && !collapsed && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded-full`}
              style={{
                backgroundColor: theme.accent.split(" ")[1],
                [isRTL ? "right" : "left"]: 0,
              }}
            />
          )}
        </div>

        {hasChildren && (
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isExpanded
                ? "grid-rows-[1fr] opacity-100 mt-1"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`flex flex-col gap-0.5 ${
                  isRTL ? "mr-5 pr-3 border-r" : "ml-5 pl-3 border-l"
                }`}
                style={{ borderColor: theme.border.split(" ")[1] }}
              >
                {renderChildren(item.children)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed z-50 group"
        style={{ bottom: "1.5rem", [isRTL ? "left" : "right"]: "1.5rem" }}
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" />
          <div
            className={`relative text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 group-hover:scale-110 active:scale-95`}
            style={{ backgroundColor: theme.accent.split(" ")[1] }}
          >
            <i
              className={`pi ${isMobileOpen ? "pi-times" : "pi-bars"}`}
              style={{ fontSize: "1.25rem" }}
            />
          </div>
        </div>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky lg:top-0 h-screen z-40
          ${theme.sidebarBg}
          flex flex-col transition-all duration-400 ease-out
          shadow-2xl lg:shadow-lg
          ${collapsed ? "w-20" : "w-72"}
          ${isMobileOpen ? "translate-x-0" : `${isRTL ? "translate-x-full" : "-translate-x-full"} lg:translate-x-0`}
        `}
        style={{ [isRTL ? "right" : "left"]: 0 }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header with Gradient */}
        <div
          className={`relative shrink-0 overflow-hidden bg-gradient-to-r ${theme.headerBg}`}
        >
          <div className="absolute inset-0 bg-black/5" />
       <div className="relative px-5 py-5">
  {/* Logo on top */}
  {/* <div className="flex justify-center mb-3">
    <img
      src="/asqanew.png"
      alt="ASQA"
      className="h-10 w-14 object-contain"
    />
  </div> */}

  {/* System name and button in one row */}
  <div className="flex items-center justify-between">
    {!collapsed ? (
      <>
        <div className="animate-slide-in">
          <h1
            className={`${theme.headerText} text-xl font-bold tracking-tight`}
          >
            {t("common.systme")}
          </h1>
          <h1
            className={`${theme.headerSubtext} text-[0.8725rem] font-semibold uppercase tracking-wider`}
          >
            {t("common.name")}
          </h1>
        </div>

        <button
          onClick={() => onCollapsedChange(true)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
          aria-label="Collapse sidebar"
        >
          <i
            className={`pi ${
              isRTL ? "pi-angle-right" : "pi-angle-left"
            } text-white/80 text-sm`}
          />
        </button>
      </>
    ) : (
      <div className="w-full flex justify-center">
        <button
          onClick={() => onCollapsedChange(false)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
          aria-label="Expand sidebar"
        >
          <i
            className={`pi ${
              isRTL ? "pi-angle-left" : "pi-angle-right"
            } text-white/80 text-sm`}
          />
        </button>
      </div>
    )}
  </div>
</div>
        </div>

        {/* Menu Navigation with RTL-aware scrollbar */}
        <nav
          className="flex-1 py-4 scrollbar-thin"
          style={{
            overflowY: "auto",
            direction: isRTL ? "rtl" : "ltr",
          }}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Inner wrapper to keep content direction consistent */}
          <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {menuItems.length > 0 ? (
              <div className="space-y-1">
                {menuItems.map((item) => renderMenuItem(item))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <i className="pi pi-menu mb-3 text-3xl text-gray-300" />
                <p className={`${theme.textDefault} text-sm font-medium`}>
                  No menu items loaded
                </p>
                <p className="text-gray-300 text-xs mt-1">Check back later</p>
              </div>
            )}
          </div>
        </nav>

        {/* Footer with Theme Selector */}
        <div className={`relative shrink-0 border-t ${theme.border} p-4`}>
          {!collapsed ? (
            <div className="space-y-3">
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${theme.itemHover}`}
                  aria-label="Change theme"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`pi pi-palette ${theme.iconDefault} text-sm`}
                    />
                    <span
                      className={`text-sm font-medium ${theme.textDefault}`}
                    >
                      {theme.name}
                    </span>
                  </div>
                  <i
                    className={`pi pi-chevron-down ${theme.iconDefault} text-xs transition-transform duration-200 ${showThemeSelector ? "rotate-180" : ""}`}
                  />
                </button>

                {showThemeSelector && (
                  <div
                    className={`absolute bottom-full ${isRTL ? "right-0" : "left-0"} right-0 mb-2 bg-white rounded-xl shadow-xl border ${theme.border} p-2 z-50 min-w-[160px]`}
                  >
                    {(Object.keys(themes) as ThemeKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setCurrentTheme(key);
                          setShowThemeSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          currentTheme === key
                            ? "bg-gray-100 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: themes[key].accent.split(" ")[1],
                            }}
                          />
                          <span className="text-gray-700">
                            {themes[key].name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center pt-2">
                <p className="text-gray-400 text-[0.6875rem] font-medium">
                  © 2026 ASQA System
                </p>
                <p className="text-gray-300 text-[0.625rem] mt-0.5">v2.0.0</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className={`p-2 rounded-lg transition-all duration-200 ${theme.itemHover}`}
                aria-label="Change theme"
              >
                <i className={`pi pi-palette ${theme.iconDefault} text-sm`} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Global Styles with RTL Scrollbar Support */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* RTL support for animations */
        [dir="rtl"] .animate-slide-in {
          animation: slideInRTL 0.4s ease-out;
        }
        @keyframes slideInRTL {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* RTL-aware custom scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        
        /* LTR Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 20px;
        }
        
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background: #94A3B8;
        }
        
        /* RTL Scrollbar - positioned on left side */
        [dir="rtl"] .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        [dir="rtl"] .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        [dir="rtl"] .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 20px;
        }
        
        [dir="rtl"] .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background: #94A3B8;
        }
        
        /* Firefox RTL scrollbar support */
        [dir="rtl"] .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        
        /* Focus styles for accessibility */
        .focus-visible:focus-visible {
          outline: 2px solid;
          outline-offset: 2px;
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Prevent text selection on double-click */
        .select-none {
          user-select: none;
        }
      `}</style>
    </>
  );
};
