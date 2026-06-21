import React from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "primeicons/primeicons.css";
import type { MenuItem } from "primereact/menuitem";

/* -----------------------------
   Types
------------------------------ */

interface BreadcrumbItemProps {
  label: string;
  to: string;
}

interface DynamicBreadcrumbProps {
  items: {
    label: string;
    url: string;
  }[];
  size?: string;
  radius?: string;
}

/* -----------------------------
   Helper Component
------------------------------ */

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ label, to }) => (
  <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
    {label}
  </Link>
);

/* -----------------------------
   Main Component
------------------------------ */

const DynamicBreadcrumb: React.FC<DynamicBreadcrumbProps> = ({
  items,
  size,
  radius,
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ps" || i18n.language === "dr";

  const home: MenuItem = {
    icon: "pi pi-home",
    template: (item) => (
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <i className={item.icon}></i>
      </Link>
    ),
  };

  const breadcrumbItems: MenuItem[] = items.map((item) => ({
    label: item.label,
    template: () => <BreadcrumbItem label={item.label} to={item.url} />,
  }));

  const breadCrumClassName = size
    ? size
    : "pl-5 pr-5 max-w-8xl mx-auto pt-5";

  return (
    <div className={breadCrumClassName}>
      <BreadCrumb
        home={home}
        model={breadcrumbItems}
        separatorIcon={isRTL ? "pi pi-angle-left" : "pi pi-angle-right"}
        className={radius || ""}
      />
    </div>
  );
};

export default DynamicBreadcrumb;
