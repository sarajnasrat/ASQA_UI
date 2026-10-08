import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useColorMode } from "../../../context/ColorModeContext";
import { APPEARANCE_PALETTES } from "../../../config/appearancePalettes";

export const AppearanceSelector = () => {
  const { t } = useTranslation();
  const { mode, isDark, toggleMode, primaryColor, setPrimaryColor } = useColorMode();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t("appearance.title")}
        title={t("appearance.title")}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 sm:h-10 sm:w-10"
      >
        <i className="pi pi-palette text-lg" />
      </button>
      {open && (
        <section className="absolute right-0 top-full z-[100] mt-2 w-[22rem] max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 bg-white p-4 text-gray-800 shadow-2xl">
          <h2 className="mb-3 text-sm font-semibold">{t("appearance.title")}</h2>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-gray-500">
              {t("appearance.mode")}
            </legend>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
              {[
                { id: "light", icon: "pi-sun", label: t("appearance.light") },
                { id: "dark", icon: "pi-moon", label: t("appearance.dark") },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    if ((option.id === "dark") !== isDark) toggleMode();
                  }}
                  className={`flex min-h-9 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium ${mode === option.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                >
                  <i className={`pi ${option.icon}`} />
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="mb-2 text-xs font-semibold text-gray-500">
              {t("appearance.primaryColor")}
            </legend>
            <div className="grid grid-cols-10 gap-2">
              {APPEARANCE_PALETTES.map((palette) => {
                const paletteName = t(`appearance.colors.${palette.id}`);
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setPrimaryColor(palette.id)}
                    aria-label={paletteName}
                    title={
                      palette.id === "default"
                        ? t("appearance.colors.defaultTitle")
                        : paletteName
                    }
                    aria-pressed={primaryColor === palette.id}
                    style={{
                      backgroundColor:
                        palette.id === "default" ? "#2563eb" : palette.scale[6],
                    }}
                    className={`h-6 w-6 rounded-full border-2 border-white ${primaryColor === palette.id ? "ring-2 ring-blue-500" : "ring-1 ring-gray-300"}`}
                  />
                );
              })}
            </div>
          </fieldset>
        </section>
      )}
    </div>
  );
};
