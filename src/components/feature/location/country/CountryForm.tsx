import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next'; // or your custom hook
import type { CountryFormProps } from './countryForm.types';

export const CountryForm: React.FC<CountryFormProps> = ({
  defaultValues = { translations: {} },
  onSubmit,  isSubmitting = false,
}) => {
  const { t, i18n } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues,
  });

  const translationEntries = Object.entries(defaultValues.translations || {});
  const languages = translationEntries.length > 0 
    ? translationEntries.map(([lang]) => lang)
    : ['ps', 'fa', 'ps'];

  // Language names from translations
  const getLanguageName = (lang: string) => {
    const languageNames: Record<string, string> = {
      en: t('languages.english'),
      fa: t('languages.persian'),
      ps: t('languages.pashto'),
    };
    return languageNames[lang] || lang.toUpperCase();
  };

  // Get placeholder text from translations
  const getPlaceholder = (lang: string) => {
    return t('country.form.placeholder.enterName', { 
      language: getLanguageName(lang) 
    });
  };

  // Get field label from translations
  const getFieldLabel = (field: string) => {
    return t(`country.form.labels.${field}`);
  };

  // Get validation messages from translations
  const getValidationMessage = (field: string, type: string) => {
    return t(`country.form.validation.${field}.${type}`);
  };

  console.log("language", i18n.language);

  return (
    <form id="country-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Country Code */}
      <div>
        <label 
          htmlFor="countryCode" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <div className="flex items-center gap-2">
            <span>{t('country.form.labels.countryCode')}</span>
            <span className="text-red-500">*</span>
          </div>
        </label>
        <Controller
          name="countryCode"
          control={control}
          rules={{ 
            required: getValidationMessage('countryCode', 'required'),
            minLength: {
              value: 2,
              message: getValidationMessage('countryCode', 'minLength'),
            },
            maxLength: {
              value: 3,
              message: getValidationMessage('countryCode', 'maxLength'),
            },
          }}
          render={({ field }) => (
            <div className="relative">
              <input
                {...field}
                id="countryCode"
                type="text"
                disabled={isSubmitting}
                className={`
                  w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${errors.countryCode 
                    ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }
                  ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}
                `}
                placeholder={t('country.form.placeholder.countryCode')}
              />
              {field.value && !errors.countryCode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <i className="pi pi-check-circle text-green-500" />
                </div>
              )}
            </div>
          )}
        />
        {errors.countryCode && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <i className="pi pi-exclamation-circle" />
            {errors.countryCode.message}
          </p>
        )}
      </div>

      {/* Translations */}
      <div>
        {/* <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <i className="pi pi-globe text-blue-500 text-sm" />
            <span>{t('country.form.labels.translations')}</span>
          </div>
        </label> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <div key={lang} className="space-y-1">
              <label 
                htmlFor={`translation-${lang}`}
                className="block text-xs font-medium text-gray-600 items-center gap-1"
              >
                <span>{getLanguageName(lang)}</span>
                {lang === 'en' && (
                  <span className="text-xs text-red-500">*</span>
                )}
              </label>
              <Controller
                name={`translations.${lang}`}
                control={control}
                rules={lang === 'en' ? { 
                  required: t('country.form.validation.translations.required') 
                } : {}}
                render={({ field }) => (
                  <input
                    {...field}
                    id={`translation-${lang}`}
                    type="text"
                    disabled={isSubmitting}
                    dir={lang === 'fa' || lang === 'ps' ? 'rtl' : 'ltr'}
                    className={`
                      w-full px-4 py-2.5 border rounded-lg 
                      focus:outline-none focus:ring-2 transition-all
                      ${errors.translations?.[lang] 
                        ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }
                      ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}
                      ${lang === 'fa' || lang === 'ps' ? 'text-right' : 'text-left'}
                    `}
                    placeholder={getPlaceholder(lang)}
                  />
                )}
              />
              {errors.translations?.[lang] && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <i className="pi pi-exclamation-circle" />
                  {errors.translations[lang]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
        {/* <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <i className="pi pi-info-circle" />
          {t('country.form.hint.translations')}
        </p> */}
      </div>

      {/* Hidden submit for form */}
      <button type="submit" className="hidden" />
    </form>
  );
};