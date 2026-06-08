import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";
import { UserService } from "../../../services/user.service";
import CommiteeMemberService from "../../../services/commiteeMember.service";

interface FormValues {
  userId: number | null;
  memberRole: string;
  responsibility: string;
  joinedAt: Date | null;
  active: boolean;
}

interface Props {
  committeeId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CommiteeMemberCreate: React.FC<Props> = ({
  committeeId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    formState: {  },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      userId: null,
      memberRole: "",
      responsibility: "",
      joinedAt: new Date(),
      active: true,
    },
  });

  // Role options for standardization
  const roleOptions = [
    { label: t("commitee.member.roles.CHAIRPERSON"), value: "CHAIRPERSON" },
    { label: t("commitee.member.roles.VICE_CHAIRPERSON"), value: "VICE_CHAIRPERSON" },
    { label: t("commitee.member.roles.SECRETARY"), value: "SECRETARY" },
    { label: t("commitee.member.roles.TREASURER"), value: "TREASURER" },
    { label: t("commitee.member.roles.MEMBER"), value: "MEMBER" },
    { label: t("commitee.member.roles.OBSERVER"), value: "OBSERVER" },
  ];

  // Load users
  const loadUsers = async () => {
    const response = await handleApi(
      () => UserService.getAllUsers(),
      () => {},
      showError,
      t,
    );

    if (response?.data) {
      setUsers(response.data);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Submit handler
  const onSubmit = async (data: FormValues) => {
    if (!committeeId) {
      showError(t("commitee.member.committeeRequired"));
      return;
    }

    setIsSubmitting(true);

    const payload = {
      user: { id: data.userId },
      committee: { id: committeeId },
      memberRole: data.memberRole,
      responsibility: data.responsibility,
      joinedAt: data.joinedAt,
      active: data.active,
    };

   await handleApi(
      () => CommiteeMemberService.create(payload),
      () => {
        showSuccess(t("commitee.member.createSuccess"));
        reset();
        setTimeout(() => onSuccess(), 500);
      },
      showError,
      t,
    );

    setIsSubmitting(false);
  };

  // User options
  const userOptions = users.map((user) => ({
    label: `${user.firstName} ${user.lastName}${user.email ? ` (${user.email})` : ""}`,
    value: user.id,
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50  z-50 transition-all duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t("commitee.member.create") || "Add Committee Member"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t("commitee.member.createDescription")}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("commitee.member.user") || "User"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Controller
                name="userId"
                control={control}
                rules={{ required: t("commitee.member.userRequired") }}
                render={({ field, fieldState }) => (
                  <div>
                    <Dropdown
                      value={field.value}
                      options={userOptions}
                      optionLabel="label"
                      optionValue="value"
                      placeholder={t("commitee.member.selectUser")}
                      className={`w-full ${fieldState.error ? "border-red-500" : ""}`}
                      onChange={(e) => field.onChange(e.value)}
                      filter
                      showClear
                      loading={users.length === 0}
                      panelClassName="shadow-lg rounded-lg"
                    />
                    {fieldState.error && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Member Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("commitee.member.role") || "Role"}
              </label>
              <Controller
                name="memberRole"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    options={roleOptions}
                    optionLabel="label"
                    optionValue="value"
                    placeholder={t("commitee.member.selectRole")}
                    className="w-full"
                    onChange={(e) => field.onChange(e.value)}
                    showClear
                  />
                )}
              />
            </div>

            {/* Responsibility */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("commitee.member.responsibility") || "Responsibility"}
              </label>
              <Controller
                name="responsibility"
                control={control}
                render={({ field }) => (
                  <div>
                    <InputTextarea
                      {...field}
                      rows={3}
                      placeholder={t("commitee.member.responsibilityPlaceholder")}
                      className="w-full resize-y"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t("commitee.member.responsibilityHint")}
                    </p>
                  </div>
                )}
              />
            </div>

            {/* Joined Date */}

            {/* Active Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900 block">
                        {t("commitee.member.active") || "Active Member"}
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        {t("commitee.member.activeHint")}
                      </span>
                    </div>
                  </label>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("common.saving")}
                  </>
                ) : (
                  t("commitee.member.save")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
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
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .zoom-in {
          animation-name: zoomIn;
        }
      `}</style>
    </>
  );
};

export default CommiteeMemberCreate;
