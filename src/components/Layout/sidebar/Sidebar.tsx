import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "primeicons/primeicons.css";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    const storedMenus = JSON.parse(localStorage.getItem("menus") || "[]");
    setMenuItems(storedMenus);
  }, []);

  useEffect(() => setIsMobileOpen(false), [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSubmenu = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const handleMenuItemClick = (item: any) => {
    if (!item.children || item.children.length === 0) {
      navigate(item.path);
    } else {
      toggleSubmenu(item.id);
    }
  };

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
            className="group relative block"
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
              className={`absolute inset-0 rounded-lg transition-all duration-300
                ${
                  childActive
                    ? "bg-indigo-50/80 shadow-sm"
                    : isChildHovered
                    ? "bg-slate-50 scale-105 shadow-sm"
                    : "bg-transparent scale-100"
                }`}
            />

            <div
              className={`relative flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <div className="flex items-center justify-center transition-all duration-300">
                {child.icon ? (
                  <i className={`${child.icon} ${childActive ? "text-indigo-600" : "text-slate-400"}`} />
                ) : (
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      childActive
                        ? "bg-indigo-500 scale-150"
                        : isChildHovered
                        ? "bg-indigo-400 scale-125"
                        : "bg-slate-300 group-hover:bg-slate-400"
                    }`}
                  />
                )}
              </div>

              {!collapsed && (
                <span
                  className={`flex-1 text-sm font-medium transition-all duration-200 ${
                    childActive
                      ? "text-indigo-700"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {getLabel(child)}
                </span>
              )}

              {hasGrandChildren && !collapsed && (
                <i
                  className={`pi pi-chevron-down text-xs transition-all duration-300 ${
                    isExpanded ? "rotate-180 text-indigo-600" : "text-slate-400"
                  }`}
                />
              )}
            </div>

            {childActive && !collapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
            )}
          </Link>

          {hasGrandChildren && (
            <div
              className={`grid transition-all duration-400 ease-in-out ${
                isExpanded
                  ? "grid-rows-[1fr] opacity-100 mt-1"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-indigo-100">
                  {renderChildren(child.children, depth + 1)}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const renderMenuItem = (item: any) => {
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id} className="px-2 mb-1">
        <div
          className={`group relative flex items-center w-full cursor-pointer transition-all duration-300 ease-out ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          onClick={() => handleMenuItemClick(item)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div
            className={`absolute inset-0 rounded-xl transition-all duration-300 ${
              active
                ? "bg-linear-to-r from-indigo-50 to-indigo-50/50 shadow-sm"
                : isHovered
                ? "bg-slate-50 scale-105 shadow-sm"
                : "bg-transparent scale-100"
            }`}
          />

          <div
            className={`relative flex items-center w-full px-4 py-3 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <i
                className={`${item.icon} text-xl ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
              />

              {!collapsed && (
                <span
                  className={`font-medium ${
                    active ? "text-indigo-700 font-semibold" : "text-slate-600"
                  }`}
                >
                  {getLabel(item)}
                </span>
              )}
            </div>

            {hasChildren && !collapsed && (
              <i
                className={`pi pi-chevron-down transition-transform ${
                  isExpanded ? "rotate-180 text-indigo-600" : "text-slate-400"
                }`}
              />
            )}
          </div>

          {active && !collapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
          )}
        </div>

        {hasChildren && (
          <div
            className={`grid transition-all duration-400 ease-in-out ${
              isExpanded
                ? "grid-rows-[1fr] opacity-100 mt-2"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-indigo-100">
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
      {/* Mobile Toggle Button - Modern Floating Action Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-50 group"
      >
        <div className="relative">
          {/* Ripple effect background */}
          <div className="absolute inset-0 bg-indigo-500 rounded-2xl animate-ping opacity-20" />
          <div className="relative bg-linear-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-indigo-500/30 group-hover:scale-110 active:scale-95">
            <i
              className={`pi ${isMobileOpen ? "pi-times" : "pi-bars"} text-2xl transition-transform duration-300 group-hover:rotate-180`}
            />
          </div>
        </div>
      </button>

      {/* Mobile Overlay with Blur Effect */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-linear-to-br from-black/60 via-black/50 to-transparent backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 h-screen
          bg-white/90 backdrop-blur-xl border-r border-white/20
          flex flex-col transition-all duration-500 ease-out
          shadow-2xl lg:shadow-xl
          ${collapsed ? "w-20" : "w-70"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header with Glass Morphism Effect */}
   <div className="relative h-20 px-4 flex items-center shrink-0 overflow-hidden border-b border-slate-200/80 shadow-sm">
  {/* Background Gradient */}
  <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-slate-50" />

  {/* Animated Lines */}
  <div className="absolute inset-0 opacity-30">
    <div className="absolute top-0 left-0 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
  </div>

  {/* Decorative bottom border with gradient */}
  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

  {/* Content */}
  <div className="relative flex items-center justify-between w-full z-10">
    {/* Logo section - Always visible */}
    <div className="flex items-center gap-4 min-w-0">
      <div className="relative group shrink-0">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-200 to-purple-200 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        <img
          src="/aqsa.jpg"
          alt="ASQA"
          className="relative h-12 w-12 object-contain rounded-xl bg-white p-1.5 shadow-md ring-1 ring-slate-200/50"
        />
      </div>

      {/* Title - Only shown when not collapsed */}
      {!collapsed && (
        <div className="animate-slide-in shrink-0">
          <h1 className="text-2xl font-bold bg-linear-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight leading-none">
            ASQA
          </h1>
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-wider">
            Management System
          </p>
        </div>
      )}
    </div>

    {/* Collapse Button */}
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="relative group shrink-0"
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <div className="absolute inset-0 bg-slate-200 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-2 rounded-xl hover:bg-white/50 text-slate-500 hover:text-indigo-600 transition-all duration-300 group-hover:scale-110">
        <i
          className={`pi ${collapsed ? "pi-angle-right" : "pi-angle-left"} text-xl`}
        />
      </div>
    </button>
  </div>
</div>

        {/* Menu with Smooth Scrolling */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
          {menuItems.length > 0 ? (
            <div className="space-y-1">
              {menuItems.map((item) => renderMenuItem(item))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12 px-4">
              <i className="pi pi-menu text-4xl mb-3 opacity-30" />
              <p className="text-sm font-medium">No menu items loaded</p>
              <p className="text-xs opacity-50 mt-1">Check back later</p>
            </div>
          )}
        </nav>

        {/* Footer with Gradient */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-linear-to-t from-indigo-50 via-white to-transparent" />
          <div className="relative p-4 text-center">
            {!collapsed && (
              <p className="text-xs text-slate-400 font-medium">
                © 2026 ASQA System
                <span className="block text-[10px] text-indigo-300 mt-0.5">
                  v2.0.0
                </span>
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Add custom animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};