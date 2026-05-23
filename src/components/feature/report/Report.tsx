import { TabMenu } from "primereact/tabmenu";
import { useState } from "react";
import { CertificationRequestReport } from "./CertificationRequestReport";
import StatusTabMenu, { type StatusTabItem } from "../../common/StatusTabMenu";
import { t } from "i18next";
import { set } from "react-hook-form";

export const Report = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // ================= STATUS STATE =================
  const [status, setStatus] = useState<string>("SUBMITTED");
  const [first, setFirst] = useState(0);
  // ================= TAB ITEMS =================
  const statusTabs: StatusTabItem[] = [
        {
      label: t("certificationRequest.statusOptions.CERTIFICATE_ISSUED"),
      value: "CERTIFICATE_ISSUED",
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
        onChange={(index, value) => {
          setActiveIndex(index);
          setStatus(value);
          setFirst(0); // reset pagination
        }}
      />

      <CertificationRequestReport />
    </div>
  );
};
