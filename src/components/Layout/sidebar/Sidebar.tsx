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
    setExpandedItems((prev) => {
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
                    ? "bg-blue-50/80 shadow-sm"
                    : isChildHovered
                      ? "bg-gray-100 scale-105 shadow-sm"
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
                  <i
                    className={`${child.icon} ${childActive ? "text-blue-600" : "text-gray-400"}`}
                  />
                ) : (
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      childActive
                        ? "bg-blue-500 scale-150"
                        : isChildHovered
                          ? "bg-blue-400 scale-125"
                          : "bg-gray-300 group-hover:bg-gray-400"
                    }`}
                  />
                )}
              </div>

              {!collapsed && (
                <span
                  className={`flex-1 text-sm font-medium transition-all duration-200 ${
                    childActive
                      ? "text-blue-700"
                      : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  {getLabel(child)}
                </span>
              )}

              {hasGrandChildren && !collapsed && (
                <i
                  className={`pi pi-chevron-down text-xs transition-all duration-300 ${
                    isExpanded ? "rotate-180 text-blue-600" : "text-gray-400"
                  }`}
                />
              )}
            </div>

            {childActive && !collapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
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
                <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-blue-100">
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
                ? "bg-blue-50/80 shadow-sm"
                : isHovered
                  ? "bg-gray-100 scale-105 shadow-sm"
                  : "bg-transparent scale-100"
            }`}
          />

          <div
            className={`relative flex items-center w-full px-4 py-3 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div
              className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
            >
              <i
                className={`${item.icon} text-xl ${
                  active ? "text-blue-600" : "text-gray-400"
                }`}
              />

              {!collapsed && (
                <span
                  className={`font-medium ${
                    active ? "text-blue-700 font-semibold" : "text-gray-600"
                  }`}
                >
                  {getLabel(item)}
                </span>
              )}
            </div>

            {hasChildren && !collapsed && (
              <i
                className={`pi pi-chevron-down transition-transform ${
                  isExpanded ? "rotate-180 text-blue-600" : "text-gray-400"
                }`}
              />
            )}
          </div>

          {active && !collapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
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
              <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-blue-100">
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
          <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" />
          <div className="relative bg-blue-600 text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-blue-500/30 group-hover:scale-110 active:scale-95">
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 h-screen
          bg-white border-r border-gray-200
          flex flex-col transition-all duration-500 ease-out
          shadow-lg lg:shadow-sm
          ${collapsed ? "w-20" : "w-80"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="relative h-20 px-4 flex items-center shrink-0 overflow-hidden border-b border-gray-200">
          {/* Content */}
          <div className="relative flex items-center justify-between w-full z-10">
            {/* Logo section - Always visible */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative group shrink-0">
                <img
                  src="/aqsa.jpg"
                  alt="ASQA"
                  className="relative h-12 w-12 object-contain rounded-lg bg-white p-1.5 shadow-md"
                />
              </div>

              {/* Title - Only shown when not collapsed */}
              {!collapsed && (
                <div className="animate-slide-in shrink-0">
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight leading-none">
                    ASQA
                  </h1>
                  <p className="text-xs font-medium text-blue-500 uppercase tracking-wider">
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
              <div className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-all duration-300">
                <i
                  className={`pi ${collapsed ? "pi-angle-right" : "pi-angle-left"} text-xl`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Menu with Smooth Scrolling */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
          {menuItems.length > 0 ? (
            <div className="space-y-1">
              {menuItems.map((item) => renderMenuItem(item))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12 px-4">
              <i className="pi pi-menu text-4xl mb-3 opacity-30" />
              <p className="text-sm font-medium">No menu items loaded</p>
              <p className="text-xs opacity-50 mt-1">Check back later</p>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="relative shrink-0 border-t border-gray-200">
          <div className="relative p-4 text-center">
            {!collapsed && (
              <p className="text-xs text-gray-400 font-medium">
                © 2026 ASQA System
                <span className="block text-[10px] text-blue-300 mt-0.5">
                  v2.0.0
                </span>
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
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