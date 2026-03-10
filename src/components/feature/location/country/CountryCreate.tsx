import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import CountryService from "../../../../services/country.service";
import { CountryForm } from "./CountryForm";
import { useTranslation } from "react-i18next";

interface CountryCreateProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const CountryCreate: React.FC<CountryCreateProps> = ({
    onClose,
    onSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useRef<Toast>(null);
    const { t, i18n } = useTranslation();

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await CountryService.createCountry(data);
            const response = await CountryService.createCountry(data);

            toast.current?.show({
                severity: "success",
                summary: t("common.success"),
                detail: t(response.data.message),
                life: 3000,
            });
            onSuccess(); // Call success callback
        } catch (error: any) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "Failed to create country",
                life: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <div
                className="fixed inset-3 bg-black/50  z-50 animate-fadeIn"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r  ">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <i className="pi pi-flag text-blue-600 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {t("country.create")}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-300/50 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <i className="pi pi-times text-gray-500 text-xl" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <CountryForm
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            defaultValues={{
                                countryCode: "",
                                translations: { en: "", fa: "", ps: "" },
                            }}
                            isSubmitting={isSubmitting}
                        />
                    </div>

                    {/* Footer with Icons */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <i className="pi pi-times text-gray-500" />
                            {t("common.cancel")}
                        </button>
                        <button
                            type="submit"
                            form="country-form"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
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
