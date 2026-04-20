import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";
import CommiteeService from "../../../services/comitee.service";

interface CommiteeUpdateProps {
  commiteeId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface CommiteeFormValues {
  name: string;
  description: string;
  committeeType: string | null;
  active: boolean;
}

export const CommiteeUpdate: React.FC<CommiteeUpdateProps> = ({
  commiteeId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
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

  // ================= LOAD DATA =================
const loadData = async () => {
  setLoading(true);

const response = await handleApi(
  () => CommiteeService.getById(commiteeId),
    () => {},  
  showError,
  t
);

  if (response?.data?.data) {
    const data = response.data.data;

    console.log("LOADED COMMITTEE:", data);

    reset({
      name: data.name || "",
      description: data.description || "",
      committeeType: data.committeeType || null,
      active: data.active ?? true,
    });
  }

  setLoading(false);
};
  useEffect(() => {
    if (commiteeId) {
      loadData();
    }
  }, [commiteeId]);

  // ================= SUBMIT =================
  const onSubmit = async (data: CommiteeFormValues) => {
    setIsSubmitting(true);

    const response = await handleApi(
      () => CommiteeService.update(commiteeId, data),
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
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="pi pi-user-edit text-green-600 text-xl" />
              </div>
              <h2 className="text-lg font-semibold">
                {t("commitee.edit") || "Edit Committee"}
              </h2>
            </div>

            <button onClick={onClose}>
              <i className="pi pi-times" />
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <i className="pi pi-spin pi-spinner text-2xl" />
              <p className="mt-2">{t("common.loading")}</p>
            </div>
          ) : (
            /* FORM */
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

              {/* NAME */}
              <div>
                <label>{t("commitee.name")}</label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <InputText {...field} className="w-full" />
                  )}
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label>{t("commitee.description")}</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <InputText {...field} className="w-full" />
                  )}
                />
              </div>

              {/* TYPE */}
              <div>
                <label>{t("commitee.type")}</label>
                <Controller
                  name="committeeType"
                  control={control}
                  rules={{ required: "Type is required" }}
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
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 min-w-[120px] justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <i className="pi pi-spin pi-spinner" />
                      {t("common.updating")}
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
          )}
        </div>
      </div>
    </>
  );
};

export default CommiteeUpdate;