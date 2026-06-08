import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

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
      t,
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
      {/* BACKDROP with blur effect */}
      <div
        className="fixed inset-0 bg-black/50  z-50 transition-all duration-200"
        onClick={onClose}
      />

      {/* MODAL - Centered with beautiful animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER - Modern gradient design */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 backdrop-blur-sm rounded-xl">
                  <i className="pi pi-users text-gray-900 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t("commitee.create") || "Create New Committee"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Fill in the details below
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
              >
                <i className="pi pi-times text-xl" />
              </button>
            </div>
          </div>

          {/* FORM - Clean and spacious */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-5 bg-gray-50/50"
          >
            {/* NAME FIELD */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                {t("commitee.name") || "Committee Name"}
                <span className="text-red-500 text-base">*</span>
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (Required)
                </span>
              </label>

              <Controller
                name="name"
                control={control}
                rules={{ required: "Committee name is required" }}
                render={({ field }) => (
                  <div className="relative">
                    <InputText
                      {...field}
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        errors.name
                          ? "border-red-400 focus:border-red-400"
                          : "border-gray-200 focus:border-blue-400"
                      }`}
                      placeholder="e.g., Innovation Committee"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              />

              {errors.name && (
                <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
                  <i className="pi pi-exclamation-circle text-xs" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* TYPE FIELD */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                {t("commitee.type") || "Committee Type"}
                <span className="text-red-500 text-base">*</span>
              </label>

              <Controller
                name="committeeType"
                control={control}
                rules={{ required: "Please select a committee type" }}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    options={committeeTypeOptions}
                    placeholder="Select committee type"
                    className="w-full"
                    panelClassName="rounded-xl shadow-lg"
                    pt={{
                      root: {
                        className: `w-full border rounded-xl transition-all duration-200 ${
                          errors.committeeType
                            ? "border-red-400"
                            : "border-gray-200 hover:border-blue-400"
                        }`,
                      },
                      input: {
                        className: "py-2.5 px-3 rounded-xl",
                      },
                      trigger: {
                        className: "rounded-r-xl",
                      },
                    }}
                    disabled={isSubmitting}
                  />
                )}
              />

              {errors.committeeType && (
                <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
                  <i className="pi pi-exclamation-circle text-xs" />
                  {errors.committeeType.message}
                </p>
              )}
            </div>

            {/* DESCRIPTION FIELD - Textarea for better UX */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                {t("commitee.description") || "Description"}
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (Optional)
                </span>
              </label>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <InputTextarea
                      {...field}
                      rows={3}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 resize-none"
                      placeholder="Describe the committee's purpose and responsibilities..."
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              />
            </div>

            {/* ACTIVE STATUS - Modern toggle switch */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                        <i
                          className={`pi ${field.value ? "pi-check-circle" : "pi-circle"} text-green-600 text-sm`}
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          {t("commitee.active") || "Active Status"}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {field.value
                            ? "Committee is visible and operational"
                            : "Committee is temporarily disabled"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full
                        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        ${field.value ? "bg-green-500" : "bg-gray-300"}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300
                          ${field.value ? "translate-x-6" : "translate-x-1"}
                        `}
                      />
                    </button>
                  </label>
                )}
              />
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
              {/* CANCEL BUTTON */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="
                  px-5 py-2.5 rounded-xl
                  border-2 border-gray-200
                  text-gray-600 font-medium
                  bg-white
                  hover:bg-gray-50 hover:border-gray-300
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  order-2 sm:order-1
                "
              >
                <i className="pi pi-times text-sm" />
                {t("common.cancel") || "Cancel"}
              </button>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  px-6 py-2.5 rounded-xl
                  bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium
                  hover:from-blue-700 hover:to-indigo-700
                  shadow-md hover:shadow-lg
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  min-w-[130px]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  order-1 sm:order-2
                "
              >
                {isSubmitting ? (
                  <>
                    <i className="pi pi-spin pi-spinner text-sm" />
                    {t("common.saving") || "Creating..."}
                  </>
                ) : (
                  <>
                    <i className="pi pi-check text-sm" />
                    {t("common.save") || "Create Committee"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation-duration: 0.2s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in {
          animation-name: zoom-in;
        }
      `}</style>
    </>
  );
};

export default CommiteeCreate;
