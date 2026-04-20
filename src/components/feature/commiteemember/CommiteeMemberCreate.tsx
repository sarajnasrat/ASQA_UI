import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
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

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      userId: null,
      memberRole: "",
      responsibility: "",
      joinedAt: null,
      active: true,
    },
  });

  // ================= LOAD USERS =================
  const loadUsers = async () => {
    const response = await handleApi(
      () => UserService.getAllUsers(),
      () => {},
      showError,
      t
    );

    if (response?.data) {
      setUsers(response.data);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
    if (!committeeId) {
      showError("Committee is required");
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

    const response = await handleApi(
      () => CommiteeMemberService.create(payload),
      showSuccess,
      showError,
      t
    );

    if (response) {
      setTimeout(() => onSuccess(), 300);
    }

    setIsSubmitting(false);
  };

  // ================= USER OPTIONS (OPTIMIZED) =================
  const userOptions = users.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id,
  }));

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">
              {t("commitee.member.create") || "Add Member"}
            </h2>
            <button onClick={onClose}>
              <i className="pi pi-times" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

            {/* USER */}
            <div>
              <label>User</label>
              <Controller
                name="userId"
                control={control}
                rules={{ required: "User is required" }}
                render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    options={userOptions}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select user"
                    className="w-full"
                    onChange={(e) => field.onChange(e.value)}
                  />
                )}
              />
            </div>

            {/* ROLE */}
            <div>
              <label>Role</label>
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
              <label>Responsibility</label>
              <Controller
                name="responsibility"
                control={control}
                render={({ field }) => (
                  <InputTextarea {...field} className="w-full" />
                )}
              />
            </div>

            {/* JOINED DATE */}
            <div>
              <label>Joined Date</label>
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
              <label>Active</label>
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
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default CommiteeMemberCreate;