import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { InputTextarea } from "primereact/inputtextarea";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";
import { UserService } from "../../../services/user.service";
import CommiteeMemberService from "../../../services/commiteeMember.service";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

interface FormValues {
  userIds: number[];
  memberRole: string;
  memberDirectorate: string;
  position: string;
  responsibility: string;
  joinedAt: Date | null;
  active: boolean;
}

interface Props {
  committeeId: number | null;
  commiteeType: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CommiteeMemberCreate: React.FC<Props> = ({
  committeeId,
  commiteeType,
  onClose,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const isRTL = i18n.language === "ps" || i18n.language === "dr";
  const navigate = useNavigate();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      userIds: [],
      memberRole: "",
      memberDirectorate: "",
      position: "",
      responsibility: "",
      joinedAt: new Date(),
      active: true,
    },
  });

  const roleOptions = useMemo(
    () => [
      { label: t("commitee.member.roles.CHAIRPERSON"), value: "CHAIRPERSON" },
      {
        label: t("commitee.member.roles.MEMBER"),
        value: "MEMBER",
      },
  
    ],
    [t],
  );

  const loadUsers = async () => {
    const response = await handleApi(
      () => UserService.getAllUsers(),
      () => {},
      showError,
      t,
    );

    if (response?.data) {
      setUsers(response.data.data || response.data || []);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onSubmit = async (data: FormValues) => {
    if (!committeeId) {
      showError(t("commitee.member.committeeRequired"));
      return;
    }

    if (!data.userIds.length) {
      showError(t("commitee.member.userRequired"));
      return;
    }

    setIsSubmitting(true);

    const payload = data.userIds.map((userId) => ({
      user: { id: userId },
      committee: { id: committeeId },
      memberRole: data.memberRole,
      memberDirectorate: data.memberDirectorate,
      position: data.position,
      responsibility: data.responsibility,
      joinedAt: data.joinedAt,
      active: data.active,
    }));

    const response = await handleApi(
      () => CommiteeMemberService.create(payload),
      () => {
        showSuccess(t("common.success"), t("commitee.member.createSuccess"));
        reset();
        setTimeout(() => onSuccess(), 500);
      },
      showError,
      t,
    );

    if (!response) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const userOptions = users.map((user) => ({
    label: `${user.firstName || ""} ${user.lastName || ""}${
      user.email ? ` (${user.email})` : ""
    }`.trim(),
    value: user.id,
  }));

  const selectedItemsLabel = t("common.itemsSelected");

  const handleCreateUser = () => {
    const returnTo =
      commiteeType === "APPROVAL"
        ? "/approva-commitee"
        : commiteeType === "INSPECTION"
          ? "/inspection-commitee"
          : "/commitee-list";

    navigate("/users/new", {
      state: {
        from: "committee-member-create",
        returnTo,
        committeeId,
        commiteeType,
      },
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-all duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="animate-in fade-in zoom-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t("commitee.member.create") || "Add Committee Member"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("commitee.member.createDescription")}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 p-6"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
           
                   <label className="mb-2 block text-sm font-semibold text-gray-700">
                {t("commitee.member.user") || "User"}
                <span className="ml-1 text-red-500">*</span>
              </label>
                   <Button
                  label={t("common.create")}
                  type="button"
                  // link
                  icon="pi pi-plus"
                
                  onClick={handleCreateUser}
                />
              </div>

           
              <Controller
                name="userIds"
                control={control}
                rules={{ required: t("commitee.member.userRequired") }}
                render={({ field, fieldState }) => (
                  <div>
                    <MultiSelect
                      value={field.value}
                      options={userOptions}
                      optionLabel="label"
                      optionValue="value"
                      placeholder={t("commitee.member.selectUser")}
                      className={`committee-member-user-select w-full ${
                        isRTL ? "committee-member-user-select-rtl" : ""
                      } ${fieldState.error ? "border-red-500" : ""}`}
                      onChange={(e) => field.onChange(e.value)}
                      filter
                      display="chip"
                      loading={users.length === 0}
                      panelClassName="shadow-lg rounded-lg"
                      maxSelectedLabels={3}
                      selectedItemsLabel={selectedItemsLabel}
                    />
                    {fieldState.error && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                        <span className="inline-block h-1 w-1 rounded-full bg-red-600"></span>
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {t("commitee.details.memberDirectorate") || "Directorate"}
              </label>
              <Controller
                name="memberDirectorate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder={
                      t("commitee.member.memberDirectoratePlaceholder") ||
                      "Enter directorate"
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                )}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {t("commitee.details.position") || "Position"}
              </label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder={
                      t("commitee.member.positionPlaceholder") ||
                      "Enter position"
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                )}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
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

            <div className="rounded-lg bg-gray-50 p-4">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        {t("common.active") || "Active Member"}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {t("commitee.member.activeHint")}
                      </span>
                    </div>
                  </label>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin text-white"
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
        .committee-member-user-select .p-multiselect-label-container {
          gap: 0.375rem;
        }
        .committee-member-user-select-rtl .p-multiselect-label-container {
          padding-left: 0.75rem;
          padding-right: 0.25rem;
        }
        .committee-member-user-select-rtl .p-multiselect-trigger {
          margin-right: 0.25rem;
          margin-left: 0.5rem;
        }
        .committee-member-user-select-rtl .p-multiselect-token {
          margin-left: 0.375rem;
          margin-right: 0;
        }
        .committee-member-user-select-rtl .p-multiselect-token-icon {
          margin-right: 0.375rem;
          margin-left: 0;
        }
      `}</style>
    </>
  );
};

export default CommiteeMemberCreate;
