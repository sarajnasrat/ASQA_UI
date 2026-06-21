import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";
import CommiteeService from "../../../services/comitee.service";
import FileUploadField from "../../common/FileUploadField";

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
  const [selectedAttachmentFile, setSelectedAttachmentFile] = useState<File | null>(null);

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
      () => CommiteeService.create(data, selectedAttachmentFile),
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
    { label: t("commitee.types.technical"), value: "TECHNICAL" },
    { label: t("commitee.types.quality"), value: "QUALITY" },
    { label: t("commitee.types.administrative"), value: "ADMIN" },
  ];

  return (
    <>
      {/* BACKDROP with blur effect */}
      <div
        className="fixed inset-0 bg-black/50  z-50 transition-all duration-200"
        onClick={onClose}
      />

      {/* MODAL - Centered with beautiful animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER - Modern gradient design */}
          <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 backdrop-blur-sm rounded-xl">
                  <i className="pi pi-users text-gray-900 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {t("commitee.create")}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    {t("commitee.form.createDescription")}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-lg  text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
              >
                <i className="pi pi-times text-xl" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
            {/* FORM - Clean and spacious */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 p-4 sm:p-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
                <div className="space-y-1.5">
                  <label className="flex flex-wrap items-center gap-1 text-sm font-semibold text-gray-700">
                    {t("commitee.name")}
                    <span className="text-base text-red-500">*</span>
                    <span className="ml-0 text-xs font-normal text-gray-400 sm:ml-2">
                      {t("commitee.form.requiredHint")}
                    </span>
                  </label>

                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: t("commitee.validation.nameRequired") }}
                    render={({ field }) => (
                      <div className="relative">
                        <InputText
                          {...field}
                          className={`w-full border rounded-xl px-3 py-2.5 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                            errors.name
                              ? "border-red-400 focus:border-red-400"
                              : "border-gray-200 focus:border-blue-400"
                          }`}
                          placeholder={t("commitee.form.placeholders.name")}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  />

                  {errors.name && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <i className="pi pi-exclamation-circle text-xs" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    {t("commitee.type")}
                    <span className="text-base text-red-500">*</span>
                  </label>

                  <Controller
                    name="committeeType"
                    control={control}
                    rules={{ required: t("commitee.validation.typeRequired") }}
                    render={({ field }) => (
                      <Dropdown
                        {...field}
                        options={committeeTypeOptions}
                        placeholder={t("commitee.form.placeholders.type")}
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
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <i className="pi pi-exclamation-circle text-xs" />
                      {errors.committeeType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2 xl:col-span-1">
                  <label className="flex flex-wrap items-center gap-1 text-sm font-semibold text-gray-700">
                    {t("commitee.description")}
                    <span className="ml-0 text-xs font-normal text-gray-400 sm:ml-2">
                      {t("commitee.form.optionalHint")}
                    </span>
                  </label>

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <InputTextarea
                          {...field}
                          rows={13}
                          autoResize
                            className="w-full"

                          placeholder={t("commitee.form.placeholders.description")}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 xl:col-span-1">
                  <label className="flex flex-wrap items-center gap-1 text-sm font-semibold text-gray-700">
                    {t("commitee.form.attachmentLabel")}
                    <span className="ml-0 text-xs font-normal text-gray-400 sm:ml-2">
                      {t("commitee.form.optionalHint")}
                    </span>
                  </label>

                  <FileUploadField
                    name="committeeAttachment"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onFileSelect={setSelectedAttachmentFile}
                    helperText={t("commitee.form.attachmentHelper")}
                  />
                </div>
                <div className="md:col-span-2 xl:col-span-2">
                  <div className="rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-sm">
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <label className="group flex cursor-pointer flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-50 p-2 transition-colors group-hover:bg-green-100">
                              <i
                                className={`pi ${field.value ? "pi-check-circle" : "pi-circle"} text-green-600 text-sm`}
                              />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                {t("commitee.form.activeLabel")}
                              </span>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {field.value
                                  ? t("commitee.form.activeDescription")
                                  : t("commitee.form.inactiveDescription")}
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
                </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="mt-4 flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="
                    order-2 flex items-center justify-center gap-2
                    rounded-xl border-2 border-gray-200 bg-white
                    px-5 py-2.5 text-gray-600 font-medium
                    transition-all duration-200
                    hover:bg-gray-50 hover:border-gray-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    sm:order-1
                  "
                >
                  <i className="pi pi-times text-sm" />
                  {t("common.cancel") || "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    order-1 flex min-w-[130px] items-center justify-center gap-2
                    rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                    px-6 py-2.5 text-white font-medium
                    shadow-md transition-all duration-200
                    hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg
                    disabled:opacity-60 disabled:cursor-not-allowed
                    sm:order-2
                  "
                >
                  {isSubmitting ? (
                    <>
                      <i className="pi pi-spin pi-spinner text-sm" />
                      {t("commitee.form.creating")}
                    </>
                  ) : (
                    <>
                      <i className="pi pi-check text-sm" />
                      {t("commitee.form.createButton")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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
