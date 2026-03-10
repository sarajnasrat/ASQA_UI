import React, { useRef, useState, useEffect } from "react";
import { Toast } from "primereact/toast";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import CategoryService from "../../../services/category.service";

interface CategoryUpdateProps {
  categoryId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryFormValues {
  name: string;
  categoryType: string | null;
}

export const CategoryUpdate: React.FC<CategoryUpdateProps> = ({
  categoryId,
  onClose,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const categoryTypes = [
    { label: "COMPANY", value: "COMPANY" },
    { label: "BOTH", value: "BOTH" },
    { label: "TECHNOLOGY", value: "TECHNOLOGY" },
    { label: "SERVICE", value: "SERVICE" },
    { label: "EDUCATION", value: "EDUCATION" },
    { label: "JOB", value: "JOB" },
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      categoryType: null,
    },
  });

  // Load category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await CategoryService.getPaginatedCategories({
          id: categoryId,
        });

        const category = res.data;

        reset({
          name: category.name || "",
          categoryType: category.categoryType || null,
        });
      } catch (error: any) {
        toast.current?.show({
          severity: "error",
          summary: t("common.error"),
          detail: t("category.loadFailed"),
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, reset, t]);

  // ESC close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await CategoryService.updateCategory({
        id: categoryId,
        ...data,
      });

      toast.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: response.data?.message || t("category.updated"),
        life: 3000,
      });

      onSuccess();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail:
          error.response?.data?.message || t("category.updateFailed"),
        life: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <Toast ref={toast} position="top-right" />

      {/* Background */}
      <div
        className="fixed inset-3 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-pencil text-blue-600 text-xl" />
              </div>

              <h2 className="text-xl font-semibold text-gray-800">
                {t("category.edit")}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-300/50 rounded-lg"
            >
              <i className="pi pi-times text-gray-500 text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("category.name")}
                <span className="text-red-500 ml-1">*</span>
              </label>

              <Controller
                name="name"
                control={control}
                rules={{ required: t("category.validation.nameRequired") }}
                render={({ field }) => (
                  <InputText
                    {...field}
                    className={`w-full ${errors.name ? "p-invalid" : ""}`}
                    placeholder={t("category.placeholder.name")}
                    disabled={isSubmitting}
                  />
                )}
              />

              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Category Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("category.type")}
                <span className="text-red-500 ml-1">*</span>
              </label>

              <Controller
                name="categoryType"
                control={control}
                rules={{ required: t("category.validation.typeRequired") }}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    value={field.value}
                    options={categoryTypes}
                    onChange={(e) => field.onChange(e.value)}
                    optionLabel="label"
                    optionValue="value"
                    placeholder={t("category.placeholder.type")}
                    className={`w-full ${
                      errors.categoryType ? "p-invalid" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                )}
              />

              {errors.categoryType && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.categoryType.message}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <i className="pi pi-times" />
                {t("common.cancel")}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 min-w-[110px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="pi pi-spin pi-spinner" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <i className="pi pi-check" />
                    {t("common.update")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
        @keyframes slideUp { from {opacity:0; transform:translateY(20px)} to {opacity:1; transform:translateY(0)} }
        .animate-fadeIn { animation: fadeIn .2s ease-out }
        .animate-slideUp { animation: slideUp .25s ease-out }
      `}</style>
    </>
  );
};

export default CategoryUpdate;