import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, Building2, CheckCircle2, ShieldCheck } from "lucide-react";

interface CertificationEntrySelectionProps {
  onSelect?: (value: string) => void;
  selectedValue?: string;
  embedded?: boolean;
}

const CertificationEntrySelection = ({
  onSelect,
  selectedValue,
  embedded = false,
}: CertificationEntrySelectionProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const options = [
    {
      value: "DOMESTIC_QUALITY_CERTIFICATION",
      title: t("certification.page.certificationType.domesticType"),
      description: t(
        "certification.page.certificationType.domestic.description",
      ),
      highlights: [
        t("certification.page.certificationType.domesticOptions.system"),
        t("certification.page.certificationType.domesticOptions.services"),
        t("certification.page.certificationType.domesticOptions.product"),
      ],
      icon: ShieldCheck,
      accent: "from-blue-600 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      glow: "shadow-blue-100/80",
    },
    {
      value: "STANDARD_MARK_CERTIFICATION",
      title: t("certification.page.certificationType.standard.title"),
      description: t(
        "certification.page.certificationType.standard.description",
      ),
      highlights: [
        t("certification.page.requestType.new.title"),
        t("certification.page.requestType.renewal.title"),
        t("certification.page.certificationScope.title"),
      ],
      icon: Award,
      accent: "from-amber-500 to-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      glow: "shadow-orange-100/80",
    },
  ];

  const content = (
    <div className={embedded ? "" : "container mx-auto px-4 py-12 max-w-5xl"}>
      {/* <div className={embedded ? "text-center mb-8" : "text-center mb-10"}>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 mb-5">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          {t("registration.steps.certificationrequest")}
        </div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-[28px] shadow-lg shadow-blue-200/70 mb-6">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
          {t("certification.page.certificationType.title")}
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t("certification.page.certificationType.subtitle")}
        </p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (onSelect) {
                  onSelect(option.value);
                  return;
                }
                navigate("/certification/select-type", {
                  state: { certificationType: option.value },
                });
              }}
              className={`
          group relative rounded-2xl border bg-white p-5 
          transition-all duration-300 ease-in-out
          ${
            isSelected
              ? `${option.border} shadow-lg ${option.glow} ring-1`
              : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
          }
          hover:-translate-y-1 active:translate-y-0
          focus:outline-none focus:ring-2 
        `}
            >
              {/* Subtle gradient overlay */}
              <div
                className={`
            absolute inset-0 rounded-2xl bg-linear-to-br ${option.accent} 
            transition-opacity duration-500
            ${isSelected ? "opacity-8" : "opacity-0 group-hover:opacity-5"}
          `}
              />

              {/* Top accent line */}
              <div
                className={`
            absolute inset-x-4 top-0 h-0.5 rounded-full bg-gradient-to-r ${option.accent} 
            transition-all duration-300 origin-center
            ${isSelected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
          `}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`
                inline-flex items-center justify-center w-12 h-12 rounded-xl 
                transition-all duration-300
                ${option.bg} ring-1 ring-black/5
                ${isSelected ? "scale-105" : "group-hover:scale-105"}
              `}
                  >
                    <Icon className={`w-6 h-6 ${option.text}`} />
                  </div>
{/* 
                  <span
                    className={`
                inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium
                transition-all duration-300
                ${
                  isSelected
                    ? `${option.bg} ${option.text}`
                    : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"
                }
              `}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isSelected ? t("common.selected") : t("common.continue")}
                  </span> */}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                  {option.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {option.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2 mb-4">
                  {option.highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-gray-600"
                    >
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${option.bg}`}
                      >
                        <CheckCircle2 className={`h-3 w-3 ${option.text}`} />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                  <span
                    className={`
                h-9 w-9 rounded-full ${option.bg} 
                flex items-center justify-center 
                transition-all duration-300
                ${isSelected ? "scale-110" : "group-hover:scale-110 group-hover:translate-x-0.5"}
              `}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${option.text}`} />
                  </span>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -inset-px rounded-2xl border-2 border-transparent bg-gradient-to-r from-transparent via-${option.color}-500/20 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-100 pt-20">
      {content}
    </div>
  );
};

export default CertificationEntrySelection;
