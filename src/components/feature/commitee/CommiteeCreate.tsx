import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";
import CommiteeService from "../../../services/comitee.service";

interface CommiteeCreateProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface CommiteeFormValues {
  name: string;
  description: string;
  committeeType: string | null;
  active: boolean;
  
}

export const CommiteeCreate: React.FC<CommiteeCreateProps> = ({
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CommiteeFormValues>({
    defaultValues: {
      name: "",
      description: "",
      committeeType: null,
      active: true,
    },
  });

  // ================= ESC CLOSE =================
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // ================= SUBMIT =================
  const onSubmit = async (data: CommiteeFormValues) => {
    setIsSubmitting(true);

    const response = await handleApi(
      () => CommiteeService.create(data),
      showSuccess,
      showError,
      t
    );

    if (response) {
      setTimeout(() => onSuccess(), 500);
    }

    setIsSubmitting(false);
  };

  // ================= ENUM OPTIONS =================
  const committeeTypeOptions = [
    { label: "Technical Committee", value: "TECHNICAL" },
    { label: "Quality Committee", value: "QUALITY" },
    { label: "Administrative Committee", value: "ADMIN" },
  ];

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-users text-blue-600 text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {t("commitee.create") || "Create Committee"}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <i className="pi pi-times text-gray-600" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("commitee.name") || "Name"}
                <span className="text-red-500 ml-1">*</span>
              </label>

              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <InputText
                    {...field}
                    className={`w-full ${errors.name ? "p-invalid" : ""}`}
                    placeholder="Enter name"
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

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("commitee.description") || "Description"}
              </label>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <InputText
                    {...field}
                    className="w-full"
                    placeholder="Enter description"
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* TYPE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("commitee.type") || "Type"}
                <span className="text-red-500 ml-1">*</span>
              </label>

              <Controller
                name="committeeType"
                control={control}
                rules={{ required: "Committee type is required" }}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    options={committeeTypeOptions}
                    placeholder="Select type"
                    className="w-full"
                  />
                )}
              />
            </div>

            {/* ACTIVE */}
            <div className="flex items-center gap-2">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <label>{t("commitee.active") || "Active"}</label>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">

              {/* CANCEL */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="
                  px-4 py-2 rounded-lg
                  border border-gray-300
                  text-gray-700
                  bg-white
                  hover:bg-gray-100
                  transition-all
                  flex items-center gap-2
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <i className="pi pi-times text-sm" />
                {t("common.cancel") || "Cancel"}
              </button>

              {/* SAVE */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  px-5 py-2 rounded-lg
                  bg-blue-600 text-white
                  hover:bg-blue-700
                  shadow-sm hover:shadow-md
                  transition-all
                  flex items-center gap-2
                  min-w-[120px]
                  justify-center
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? (
                  <>
                    <i className="pi pi-spin pi-spinner text-sm" />
                    {t("common.saving") || "Saving"}
                  </>
                ) : (
                  <>
                    <i className="pi pi-check text-sm" />
                    {t("common.save") || "Save"}
                  </>
                )}
              </button>

            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CommiteeCreate;