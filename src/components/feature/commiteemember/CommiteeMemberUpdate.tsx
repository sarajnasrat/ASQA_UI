import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

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
  responsibility: string;
  joinedAt: Date | null;
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

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      userId: null,
      committeeId: null,
      memberRole: "",
      responsibility: "",
      joinedAt: null,
      active: true,
    },
  });

  // ================= LOAD USERS =================
  const loadUsers = async () => {
    const res = await handleApi(
      () => UserService.getAllUsers(),
      () => {},
      showError,
      t
    );

    if (res?.data) {
      setUsers(res.data.data || res.data);
    }
  };

  // ================= LOAD COMMITTEES =================
  const loadCommittees = async () => {
    const res = await handleApi(
      () => CommiteeService.getAll(),
      () => {},
      showError,
      t
    );

    if (res?.data) {
      setCommittees(res.data.data || res.data);
    }
  };

  // ================= LOAD MEMBER =================
  const loadMember = async () => {
    setLoading(true);

    const res = await handleApi(
      () => CommiteeMemberService.getById(commiteeMemberId),
      () => {},
      showError,
      t
    );

    if (res?.data) {
      const data = res.data || res.data;

      reset({
        userId: data.user?.id || null,
        committeeId: data.committee?.id || null,
        memberRole: data.memberRole,
        responsibility: data.responsibility,
        joinedAt: data.joinedAt ? new Date(data.joinedAt) : null,
        active: data.active,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    loadCommittees();
  }, []);

  useEffect(() => {
    if (commiteeMemberId) loadMember();
  }, [commiteeMemberId]);

  // ================= ESC CLOSE =================
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // ================= SUBMIT =================
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const payload = {
      user: { id: data.userId },
      committee: { id: data.committeeId },
      memberRole: data.memberRole,
      responsibility: data.responsibility,
      joinedAt: data.joinedAt,
      active: data.active,
    };

    const res = await handleApi(
      () => CommiteeMemberService.update(commiteeMemberId, payload),
      showSuccess,
      showError,
      t
    );

    if (res) setTimeout(() => onSuccess(), 500);

    setIsSubmitting(false);
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">
              {t("commitee.member.edit")}
            </h2>
            <button onClick={onClose}>
              <i className="pi pi-times" />
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-6 text-center">
              <i className="pi pi-spin pi-spinner text-2xl" />
              <p>{t("common.loading")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

              {/* USER */}
              <div>
                <label>{t("commitee.member.user")}</label>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      value={field.value}
                      options={users}
                      optionLabel="username"
                      optionValue="id"
                      placeholder={t("commitee.member.selectUser")}
                      className="w-full"
                      onChange={(e) => field.onChange(e.value)}
                    />
                  )}
                />
              </div>

              {/* COMMITTEE */}
              <div>
                <label>{t("commitee.member.committee")}</label>
                <Controller
                  name="committeeId"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      value={field.value}
                      options={committees}
                      optionLabel="name"
                      optionValue="id"
                      placeholder={t("commitee.member.selectCommittee")}
                      className="w-full"
                      onChange={(e) => field.onChange(e.value)}
                    />
                  )}
                />
              </div>

              {/* ROLE */}
              <div>
                <label>{t("commitee.member.role")}</label>
                <Controller
                  name="memberRole"
                  control={control}
                  render={({ field }) => (
                    <InputText {...field} className="w-full" />
                  )}
                />
              </div>

              {/* RESPONSIBILITY */}
              <div>
                <label>{t("commitee.member.responsibility")}</label>
                <Controller
                  name="responsibility"
                  control={control}
                  render={({ field }) => (
                    <InputText {...field} className="w-full" />
                  )}
                />
              </div>

              {/* DATE */}
              <div>
                <label>{t("commitee.member.joinedAt")}</label>
                <Controller
                  name="joinedAt"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      className="w-full"
                      showIcon
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
                <label>{t("common.active")}</label>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg"
                >
                  {isSubmitting
                    ? t("common.updating")
                    : t("common.update")}
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