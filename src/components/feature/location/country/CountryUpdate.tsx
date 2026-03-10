import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import CountryService from "../../../../services/country.service";
import { CountryForm } from "./CountryForm";
import { useTranslation } from "react-i18next";
import SkeletonForm from "../../../common/SkeletonForm";

interface CountryUpdateProps {
  countryId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CountryUpdate: React.FC<CountryUpdateProps> = ({
  countryId,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const toast = useRef<Toast>(null);

  // ESC key close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Load country data
  useEffect(() => {
    const loadCountry = async () => {
      try {
        const res = await CountryService.getCountryTranslation(countryId);
        const country = res.data;

        setDefaultValues({
          countryCode: country?.data.countryCode || "",
          translations: {
            en: country?.data.translations?.en || "",
            fa: country?.data.translations?.fa || "",
            ps: country?.data.translations?.ps || "",
          },
        });

        setLoading(false);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load country",
          life: 5000,
        });
        setLoading(false);
      }
    };

    loadCountry();
  }, [countryId]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const response = await CountryService.updateCountry(countryId, data);

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
        summary: "Error",
        detail: error.response?.data?.message || "Failed to update country",
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
const fileds: any[] = [
    {
      name: "countryCode",
      label: "Country Code",
    },
  {
    name: "translations.en",
    label: "English",
  },
  {
    name: "translations.ps",
    label: "Pashto",
  },
  {
    name: "translations.dr",
    label: "Dari",
  }
];
  return (
    <>
      <Toast ref={toast} position="top-right" />

      {/* Background */}
      <div
        className="fixed inset-3 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-pencil text-blue-600 text-xl" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
               { t("country.edit")}
                </h2>

              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-300/50 rounded-lg transition-colors"
            >
              <i className="pi pi-times text-gray-500 text-xl" />
            </button>
          </div>

          {/* FORM */}

          {loading ? (
            <SkeletonForm skeletonType="row" fields={fileds} />
          ) : (
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <CountryForm
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <i className="pi pi-times text-gray-500" />
              {t("common.cancel")}
            </button>

            <button
              type="submit"
              form="country-form"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <i className="pi pi-spin pi-spinner" />
                 { t("common.updating")}
                </>
              ) : (
                <>
                  <i className="pi pi-check" />
                 { t("common.update")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
