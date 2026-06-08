import React from "react";
import { FileText, Building2, File } from "lucide-react";

interface Props {
  activeTab: "details" | "company" | "documents";
  setActiveTab: (tab: "details" | "company" | "documents") => void;
  hasAttachments: number;
  t: any;
}

const CertificationRequestViewTabs: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  hasAttachments,
  t,
}) => {
  const tabs = [
    {
      id: "details",
      label: t("certificationRequest.labels.requestDetails"),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "company",
      label: t("company.companyInfo"),
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      id: "documents",
      label: t("certificationRequest.labels.attachments"),
      icon: <File className="h-4 w-4" />,
      badge: hasAttachments,
    },
  ];

  return (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex flex-wrap gap-4 md:gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">
              {tab.id === "details"
                ? "Details"
                : tab.id === "company"
                ? "Company"
                : "Docs"}
            </span>
            {tab.badge ? (
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CertificationRequestViewTabs;
