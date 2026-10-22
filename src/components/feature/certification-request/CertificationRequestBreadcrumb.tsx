import React from "react";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";

interface CertificationRequestBreadcrumbProps {
  status?: string;
  international?: boolean;
  listUrl?: string;
  labelKey?: string;
}

export const CertificationRequestBreadcrumb: React.FC<CertificationRequestBreadcrumbProps> = ({
  status,
  international = false,
  listUrl = "",
  labelKey,
}) => {
  const { t } = useTranslation();
  const namespace = international
    ? "internationalRequest.statuses"
    : "certificationRequest.statusOptions";
  const fallback = international
    ? t("internationalRequest.management")
    : t("certificationRequest.list");
    const label = labelKey
      ? t(labelKey)
      : status
        ? t(`${namespace}.${status}`, status.replaceAll("_", " "))
        : fallback;

  return (
    <DynamicBreadcrumb
      items={[{ label, url: listUrl }]}
    />
  );
};

export default CertificationRequestBreadcrumb;
