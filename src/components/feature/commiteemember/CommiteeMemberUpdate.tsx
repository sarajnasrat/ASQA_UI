import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";

import { UserService } from "../../../services/user.service";
import CommiteeService from "../../../services/comitee.service";
import CommiteeMemberService from "../../../services/commiteeMember.service";

interface Props {
  commiteeMemberId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  userId: number | null;
  committeeId: number | null;
  memberRole: string;
  memberDirectorate: string;
  position: string;
  responsibility: string;
  active: boolean;
}

export const CommiteeMemberUpdate: React.FC<Props> = ({
  commiteeMemberId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      userId: null,
      committeeId: null,
      memberRole: "",
      memberDirectorate: "",
      position: "",
      responsibility: "",
      active: true,
    },
  });

  const roleOptions = useMemo(
    () => [
      { label: t("commitee.member.roles.CHAIRPERSON"), value: "CHAIRPERSON" },
      {
        label: t("commitee.member.roles.VICE_CHAIRPERSON"),
        value: "VICE_CHAIRPERSON",
      },
      { label: t("commitee.member.roles.SECRETARY"), value: "SECRETARY" },
      { label: t("commitee.member.roles.TREASURER"), value: "TREASURER" },
      { label: t("commitee.member.roles.MEMBER"), value: "MEMBER" },
      { label: t("commitee.member.roles.OBSERVER"), value: "OBSERVER" },
    ],
    [t],
  );

  const loadUsers = async () => {
    const res = await handleApi(
      () => UserService.getAllUsers(),
      () => {},
      showError,
      t,
    );

    if (res?.data) {
      setUsers(res.data.data || res.data || []);
    }
  };

  const loadCommittees = async () => {
    const res = await handleApi(
      () => CommiteeService.getAll(),
      () => {},
      showError,
      t,
    );

    if (res?.data) {
      setCommittees(res.data.data || res.data || []);
    }
  };

  const loadMember = async () => {
    setLoading(true);

    const res = await handleApi(
      () => CommiteeMemberService.getById(commiteeMemberId),
      () => {},
      showError,
      t,
    );

    if (res?.data) {
      const data = res.data.data || res.data;

      reset({
        userId: data?.user?.id ?? null,
        committeeId: data?.committee?.id ?? null,
        memberRole: data?.memberRole ?? "",
        memberDirectorate: data?.memberDirectorate ?? "",
        position: data?.position ?? "",
        responsibility: data?.responsibility ?? "",
        active: data?.active ?? true,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    loadCommittees();
  }, []);

  useEffect(() => {
    if (commiteeMemberId) {
      loadMember();
    }
  }, [commiteeMemberId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const payload = {
      user: { id: data.userId },
      committee: { id: data.committeeId },
      memberRole: data.memberRole,
      memberDirectorate: data.memberDirectorate,
      position: data.position,
      responsibility: data.responsibility,
      active: data.active,
    };

    const res = await handleApi(
      () => CommiteeMemberService.update(commiteeMemberId, payload),
      () => showSuccess(t("common.success"), t("commitee.member.updated")),
      showError,
      t,
    );

    if (res) {
      setTimeout(() => onSuccess(), 500);
    }

    setIsSubmitting(false);
  };

  const userOptions = users.map((user) => ({
    label: `${user.firstName || ""} ${user.lastName || ""}${
      user.email ? ` (${user.email})` : ""
    }`.trim(),
    value: user.id,
  }));

  const committeeOptions = committees.map((committee) => ({
    label: committee.name,
    value: committee.id,
  }));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t("commitee.member.edit")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("commitee.member.updateDescription")}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600"
            >
              <i className="pi pi-times" />
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <i className="pi pi-spin pi-spinner text-2xl" />
              <p className="mt-2">{t("common.loading")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {t("commitee.member.user")}
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
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-red-600">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {t("commitee.member.committee")}
                </label>
                <Controller
                  name="committeeId"
                  control={control}
                  rules={{ required: t("commitee.member.committeeRequired") }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Dropdown
                        value={field.value}
                        options={committeeOptions}
                        optionLabel="label"
                        optionValue="value"
                        placeholder={t("commitee.member.selectCommittee")}
                        className={`w-full ${fieldState.error ? "border-red-500" : ""}`}
                        onChange={(e) => field.onChange(e.value)}
                        filter
                        showClear
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-red-600">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {t("commitee.member.role")}
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
                  {t("commitee.member.responsibility")}
                </label>
                <Controller
                  name="responsibility"
                  control={control}
                  render={({ field }) => (
                    <InputTextarea
                      {...field}
                      rows={3}
                      placeholder={t("commitee.member.responsibilityPlaceholder")}
                      className="w-full resize-y"
                    />
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
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="block text-sm font-semibold text-gray-900">
                          {t("common.active") || t("common.active")}
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
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? t("common.updating") : t("common.update")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default CommiteeMemberUpdate;
