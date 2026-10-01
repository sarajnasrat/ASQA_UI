import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

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
      icon: ShieldCheck,
      accent: "from-amber-500 to-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      glow: "shadow-orange-100/80",
    },
  ];

  const content = (
    <div className={embedded ? "" : "container mx-auto max-w-5xl px-4 py-12"}>
      <div className={embedded ? "mb-8 text-start" : "mb-10 text-center"}>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 md:text-2xl">
          {t("certification.page.certificationType.certificationTypeLabel")}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          group relative flex min-h-[330px] flex-col overflow-hidden rounded-3xl border bg-white p-6 text-start
          transition-all duration-300 ease-in-out
          ${
            isSelected
              ? `${option.border} shadow-xl ${option.glow} ring-2 ring-offset-2`
              : "border-slate-200 shadow-sm hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
          }
          active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
            >
              {/* Subtle gradient overlay */}
              <div
                className={`
            absolute inset-0 rounded-3xl bg-linear-to-br ${option.accent}
            transition-opacity duration-500
            ${isSelected ? "opacity-[0.08]" : "opacity-0 group-hover:opacity-[0.04]"}
          `}
              />

              {/* Top accent line */}
              <div
                className={`
            absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r ${option.accent}
            transition-all duration-300 origin-center
            ${isSelected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
          `}
              />

              <div className="relative flex h-full flex-col">
                {/* Header */}
                <div className="mb-5 flex items-center gap-4">
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
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {option.title}
                    </h3>
                    {isSelected && (
                      <span
                        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${option.text}`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("common.selected")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mb-5 text-sm leading-6 text-slate-600">
                  {option.description}
                </p>

                {/* Highlights */}
                <div className="mb-6 space-y-3">
                  {option.highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-600"
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
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className={`text-sm font-semibold ${option.text}`}>
                    {isSelected ? t("common.selected") : t("common.continue")}
                  </span>
                  <span
                    className={`
                h-9 w-9 rounded-full ${option.bg} 
                flex items-center justify-center 
                transition-all duration-300
                ${isSelected ? "scale-110" : "group-hover:scale-110 group-hover:translate-x-0.5"}
              `}
                  >
                    <ArrowRight
                      className={`h-4 w-4 ${option.text} transition-transform group-hover:translate-x-1 rtl:rotate-180`}
                    />
                  </span>
                </div>
              </div>
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
