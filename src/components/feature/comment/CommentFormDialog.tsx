import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import CommentService from "../../../services/comment.service";

interface CommentForm {
  fullName: string;
  email: string;
  subject: string;
  body: string;
}

interface Props {
  visible: boolean;
  commentId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultForm: CommentForm = {
  fullName: "",
  email: "",
  subject: "",
  body: "",
};

export const CommentFormDialog: React.FC<Props> = ({
  visible,
  commentId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CommentForm>(defaultForm);

  const isEdit = Boolean(commentId);

  useEffect(() => {
    if (!visible) return;
    if (!commentId) {
      setForm(defaultForm);
      return;
    }

    const loadById = async () => {
      setLoading(true);
      const response = await handleApi(
        () => CommentService.getCommentById(commentId),
        () => {},
        showError,
        t,
      );
      if (response) {
        const data = response.data?.data || response.data;
        setForm({
          fullName: data?.fullName || "",
          email: data?.email || "",
          subject: data?.subject || "",
          body: data?.body || "",
        });
      }
      setLoading(false);
    };

    loadById();
  }, [commentId, showError, t, visible]);

  const validate = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.subject.trim() || !form.body.trim()) {
      showError(t("common.error"), t("comment.validation.requiredFields"));
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      showError(t("common.error"), t("comment.validation.invalidEmail"));
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
    };
    const response = await handleApi(
      () =>
        isEdit && commentId
          ? CommentService.updateComment(commentId, payload)
          : CommentService.createComment(payload),
      showSuccess,
      showError,
      t,
    );
    if (response) {
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={isEdit ? t("comment.editTitle") : t("comment.createTitle")}
      style={{ width: "95vw", maxWidth: "700px" }}
      modal
      draggable={false}
      resizable={false}
    >
      {loading ? (
        <div className="py-8 text-center text-gray-500">{t("common.loading")}</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("comment.fullName")} *
            </label>
            <InputText
              value={form.fullName}
              className="w-full"
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("comment.email")} *
            </label>
            <InputText
              value={form.email}
              className="w-full"
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("comment.columns.subject")} *
            </label>
            <InputText
              value={form.subject}
              className="w-full"
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("comment.body")} *
            </label>
            <InputTextarea
              rows={5}
              value={form.body}
              className="w-full"
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button label={t("common.cancel")} outlined onClick={onClose} disabled={saving} />
            <Button
              label={isEdit ? t("common.update") : t("common.save")}
              loading={saving}
              onClick={onSubmit}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CommentFormDialog;
