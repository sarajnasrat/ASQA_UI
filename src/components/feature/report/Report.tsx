import { useState } from "react";
import { CertificationRequestReport } from "./CertificationRequestReport";
import StatusTabMenu, { type StatusTabItem } from "../../common/StatusTabMenu";
import { useTranslation } from "react-i18next";

export const Report = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  // ================= STATUS STATE =================
  // const [status, setStatus] = useState<string>("SUBMITTED");
  // const [first, setFirst] = useState(0);
  // ================= TAB ITEMS =================
  const statusTabs: StatusTabItem[] = [
        {
      label: t("certificationRequest.statusOptions.AUTHORITY_DECISION"),
      value: "AUTHORITY_DECISION",
      icon: "pi pi-check-circle",
    },
    {
      label: t("certificationRequest.statusOptions.SUBMITTED"),
      value: "SUBMITTED",
      icon: "pi pi-send",
    },

    {
      label: t("certificationRequest.statusOptions.REJECTED"),
      value: "REJECTED",
      icon: "pi pi-times-circle",
    },

    {
      label: t("certificationRequest.statusOptions.CANCELLED"),
      value: "CANCELLED",
      icon: "pi pi-calendar",
    },


  ];
  return (
    <div className="card">
      {/* ================= TAB MENU ================= */}
      <StatusTabMenu
        items={statusTabs}
        activeIndex={activeIndex}
        onChange={(index) => {
          setActiveIndex(index);
 
        }}
      />

      <CertificationRequestReport />
    </div>
  );
};
