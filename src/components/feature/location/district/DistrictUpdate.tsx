import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";
import DistrictService from "../../../../services/district.service";

interface Province {
  id: number;
  name: string;
}

interface DistrictUpdateProps {
  districtId?: number; // optional for create/update distinction
  provinces: Province[];
  onClose: () => void;
  onSuccess: () => void;
}

type Translations = { en: string; fa: string; ps: string };

interface DistrictFormValues {
  provinceId: number | null;
  translations: Translations;
}

export const DistrictUpdate: React.FC<DistrictUpdateProps> = ({
  districtId,
  provinces,
  onClose,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!districtId);

  // Setup form
  const { control, handleSubmit, formState: { errors }, reset } = useForm<DistrictFormValues>({
    defaultValues: {
      provinceId: null,
      translations: { en: "", fa: "", ps: "" },
    },
  });

  // Load district data if updating
  useEffect(() => {
    if (!districtId) return;
  if (!districtId) {
    reset({
      provinceId: provinces[0].id, // set first province as default
      translations: { en: "", fa: "", ps: "" },
    });}
    const loadDistrict = async () => {
      try {
        const res = await DistrictService.getDistrictTranslation(districtId);
        const district = res.data.data;
        reset({
          provinceId: district?.province?.id || provinces[0]?.id || null,
          translations: district?.translations || { en: "", fa: "", ps: "" },
        });
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: t("common.error"),
          detail: t("district.loadFailed"),
          life: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDistrict();
  }, [districtId, provinces, reset, t]);

  // ESC to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Submit
  const onSubmit = async (data: DistrictFormValues) => {
    setIsSubmitting(true);
    try {
      const response = districtId
        ? await DistrictService.updateDistrict(districtId, data)
        : await DistrictService.createDistrict(data);

      toast.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: t(response.data.message),
        life: 3000,
      });
      onSuccess();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: error.response?.data?.message || t(districtId ? "district.updateFailed" : "district.createFailed"),
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const languages: (keyof Translations)[] = ["en", "fa", "ps"];
  const getLanguageName = (lang: keyof Translations) => ({"en": t("languages.english"), "fa": t("languages.persian"), "ps": t("languages.pashto")})[lang];

  if (loading) return <div className="p-6 text-center text-gray-500">{t("common.loading")}...</div>;
console.log("provinces:", provinces);
  return (
    <>
      <Toast ref={toast} position="top-right" />
      <div className="fixed inset-3 bg-black/50 z-50 animate-fadeIn" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-map-marker text-blue-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{districtId ? t("district.update") : t("district.create")}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-300/50 rounded-lg">
              <i className="pi pi-times text-gray-500 text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("district.form.labels.province")}<span className="text-red-500 ml-1">*</span>
              </label>
              <Controller
                name="provinceId"
                control={control}
                rules={{ required: t("district.form.validation.province.required") }}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    options={provinces}
                    optionLabel="provinceName"
                    optionValue="id"
                    placeholder={t("district.form.placeholder.province")}
                    className={`w-full ${errors.provinceId ? "p-invalid" : ""}`}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.provinceId && <p className="text-sm text-red-600 mt-1">{errors.provinceId.message}</p>}
            </div>

            {/* Translations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map((lang) => (
                <div key={lang}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {getLanguageName(lang)}
                    {lang === "en" && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Controller
                    name={`translations.${lang}`}
                    control={control}
                    rules={lang === "en" ? { required: t("district.form.validation.name.required") } : {}}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        type="text"
                        disabled={isSubmitting}
                        dir={lang === "fa" || lang === "ps" ? "rtl" : "ltr"}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                          ${errors.translations?.[lang] ? "border-red-300 bg-red-50 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}
                          ${lang === "fa" || lang === "ps" ? "text-right" : "text-left"}`}
                        placeholder={t("district.form.placeholder.name", { language: getLanguageName(lang) })}
                      />
                    )}
                  />
                  {errors.translations?.[lang] && <p className="text-xs text-red-600 mt-1">{errors.translations[lang]?.message}</p>}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-4">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="pi pi-times text-gray-500" /> {t("common.cancel")}
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center">
                {isSubmitting ? (
                  <>
                    <i className="pi pi-spin pi-spinner" /> {t("common.saving")}
                  </>
                ) : (
                  <>
                    <i className="pi pi-check" /> {t("common.save")}
                  </>
                )}
              </button>
            </div>
          </form>
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