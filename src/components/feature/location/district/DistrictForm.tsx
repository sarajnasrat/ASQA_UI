import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";
import type { DistrictFormProps } from "./districtForm.types";

const DistrictForm: React.FC<DistrictFormProps> = ({
  defaultValues = { translations: {}, provinceId: null },
  provinces = [],
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const languages = ["en", "fa", "ps"];

  const getLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      en: t("languages.english"),
      fa: t("languages.persian"),
      ps: t("languages.pashto"),
    };
    return names[lang];
  };

  return (
    <form
      id="district-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Province Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("district.form.labels.province")}
          <span className="text-red-500 ml-1">*</span>
        </label>

        <Controller
          name="provinceId"
          control={control}
          rules={{ required: t("district.form.validation.province.required") }}
          render={({ field }) => (
            <Dropdown
              {...field}
              options={provinces}
              optionLabel="provinceName" // <-- match API field
              optionValue="id"
              placeholder={t("district.form.placeholder.province")}
              className={`w-full ${errors.provinceId ? "p-invalid" : ""}`}
              disabled={isSubmitting}
            />
          )}
        />

        {errors.provinceId && (
          <p className="text-sm text-red-600 mt-1">
            {errors.provinceId.message as string}
          </p>
        )}
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
              rules={
                lang === "en"
                  ? { required: t("district.form.validation.name.required") }
                  : {}
              }
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  disabled={isSubmitting}
                  dir={lang === "fa" || lang === "ps" ? "rtl" : "ltr"}
                  className={`
                    w-full px-4 py-2.5 border rounded-lg
                    focus:outline-none focus:ring-2 transition-all
                    ${
                      errors.translations?.[lang]
                        ? "border-red-300 bg-red-50 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }
                    ${lang === "fa" || lang === "ps" ? "text-right" : "text-left"}
                  `}
                  placeholder={t("district.form.placeholder.name", {
                    language: getLanguageName(lang),
                  })}
                />
              )}
            />

            {errors.translations?.[lang] && (
              <p className="text-xs text-red-600 mt-1">
                {errors.translations[lang]?.message as string}
              </p>
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="hidden" />
    </form>
  );
};

export default DistrictForm;