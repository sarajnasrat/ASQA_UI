import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";
import ProvinceService from "../../../../services/province.service";

interface Country {
  id: number;
  countryName: string;
  countryCode: string;
}

interface ProvinceUpdateProps {
  provinceId: number;
  countries: Country[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ProvinceFormValues {
  translations: { en: string; ps: string; fa: string };
  countryId: number | null;
}

export const ProvinceUpdate: React.FC<ProvinceUpdateProps> = ({
  provinceId,
  countries,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef<Toast>(null);
  const { t } = useTranslation();

  const defaultFormValues: ProvinceFormValues = {
    translations: { en: "", ps: "", fa: "" },
    countryId: countries[0]?.id || null,
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProvinceFormValues>({
    defaultValues: defaultFormValues,
  });

  // Load province data and set form
  useEffect(() => {
    const loadProvince = async () => {
      try {
        const res = await ProvinceService.getProvinceTranslation(provinceId);
        const data = res.data.data;

        // Ensure translations exist and fallback to empty strings
        const translations = data.translations || { en: "", ps: "", fa: "" };
          console.log("translations:", translations);
        reset({
          translations: {
            en: translations.en || "",
            ps: translations.ps || "",
            fa: translations.fa || "",
          },
          countryId: data.country?.id || countries[0]?.id || null,
        });
      } catch (error: any) {
        toast.current?.show({
          severity: "error",
          summary: t("common.error"),
          detail: t("province.loadFailed"),
          life: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProvince();
  }, [provinceId, countries, reset, t]);

  // ESC key closes modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const onSubmit = async (data: ProvinceFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        provinceId,
        translations: {
          en: data.translations.en,
          ps: data.translations.ps,
          fa: data.translations.fa,
        },
        countryId: data.countryId,
      };

      const res = await ProvinceService.updateProvince(provinceId, payload);
      toast.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: t(res.data.message || "province.updated"),
        life: 3000,
      });
      onSuccess();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: error.response?.data?.message || t("province.updateFailed"),
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const languages: Array<keyof ProvinceFormValues["translations"]> = ["en", "ps", "fa"];
  const getLanguageName = (lang: keyof ProvinceFormValues["translations"]) =>
    ({
      en: t("languages.english"),
      ps: t("languages.pashto"),
      fa: t("languages.dari"),
    })[lang];

  return (
    <>
      <Toast ref={toast} position="top-right" />

      <div className="fixed inset-3 bg-black/50 z-50 animate-fadeIn" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r">
            <h2 className="text-xl font-semibold text-gray-800">{t("province.update")}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-300/50 rounded-lg">
              <i className="pi pi-times text-gray-500 text-xl" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6"
            id="province-form"
          >
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("province.form.labels.country")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Controller
                name="countryId"
                control={control}
                rules={{ required: t("province.form.validation.country.required") }}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    options={countries}
                    optionLabel="countryName"
                    optionValue="id"
                    placeholder={t("province.form.placeholder.country")}
                    className={`w-full ${errors.countryId ? "p-invalid" : ""}`}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.countryId && (
                <p className="text-sm text-red-600 mt-1">{errors.countryId.message}</p>
              )}
            </div>

            {/* Multilingual Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map((lang) => (
                <div key={lang}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {getLanguageName(lang)}
                    {lang === "en" && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Controller
                    name={`translations.${lang}` as any}
                    control={control}
                    rules={
                      lang === "en"
                        ? { required: t("province.form.validation.name.required") }
                        : {}
                    }
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        disabled={isSubmitting}
                        dir={lang === "ps" || lang === "fa" ? "rtl" : "ltr"}
                        value={field.value ?? ""}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                          ${errors.translations?.[lang] ? "border-red-300 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}
                          ${lang === "ps" || lang === "fa" ? "text-right" : "text-left"}
                        `}
                        placeholder={t("province.form.placeholder.name", { language: getLanguageName(lang) })}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.translations?.[lang] && (
                    <p className="text-xs text-red-600 mt-1">{errors.translations?.[lang]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="pi pi-times text-gray-500" />
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              form="province-form"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <i className="pi pi-spin pi-spinner" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <i className="pi pi-check" />
                  {t("common.save")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
};