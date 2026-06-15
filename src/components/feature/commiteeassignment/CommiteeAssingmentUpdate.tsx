import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import CommiteeAssignmentService from "../../../services/commitee-assignment.service";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import FileUploadField from "../../common/FileUploadField";
import { Navigate, useNavigate } from "react-router-dom";

interface Props {
  visible: boolean;
  onHide: () => void;
  assignmentId: number | null;
  currentStatus?: string | null;
  preferredStatus?: string | null;
  onSuccess: () => void;
}

const transitionMap: Record<string, string[]> = {
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
};

export const CommiteeAssingmentUpdate: React.FC<Props> = ({
  visible,
  onHide,
  assignmentId,
  currentStatus,
  preferredStatus,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      assignmentStatus: "",
      remarks: "",
    },
  });
  const navigate = useNavigate();
  const watchedStatus = watch("assignmentStatus");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const lockedStatus =
    preferredStatus &&
    preferredStatus !== currentStatus &&
    (preferredStatus === "COMPLETED" || preferredStatus === "REJECTED")
      ? preferredStatus
      : null;

  const statusOptions = useMemo(() => {
    const transitionOptions = transitionMap[currentStatus || ""];
    const options =
      transitionOptions && transitionOptions.length > 0
        ? transitionOptions
        : currentStatus
          ? [currentStatus]
          : ["IN_PROGRESS", "COMPLETED", "REJECTED"];

    return options.map((status) => ({
      label: t(`commitee.assignment.status.${status.toLowerCase()}`),
      value: status,
    }));
  }, [currentStatus, t]);

  useEffect(() => {
    if (assignmentId && visible) {
      CommiteeAssignmentService.getById(assignmentId).then((res: any) => {
        const data = res.data.data;
        const nextStatus =
          lockedStatus &&
          statusOptions.some((option) => option.value === lockedStatus)
            ? lockedStatus
            : data.assignmentStatus;

        reset({
          assignmentStatus: nextStatus,
          remarks: data.remarks,
        });
        setSelectedFile(null);
      });
    }
  }, [assignmentId, visible, reset, lockedStatus, statusOptions]);

  const onSubmit = async (data: any) => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      const response = await handleApi(
        () =>
          CommiteeAssignmentService.patchUpdate(
            assignmentId,
            data,
            selectedFile || undefined,
          ),
        showSuccess,
        showError,
        t,
      );
      if (response?.status == 200) {
        navigate("/commitee-assignment-list");
      }
      onSuccess();
      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={t("commitee.assignment.dialog.updateTitle")}
      visible={visible}
      onHide={onHide}
      style={{ width: "40vw" }}
      modal
      className="rounded-lg shadow-xl"
      pt={{
        header: {
          className:
            "bg-gray-50 border-b border-gray-200 text-gray-800 font-semibold p-4",
        },
        content: { className: "p-6" },
      }}
    >
      <form className="p-fluid" onSubmit={handleSubmit(onSubmit)}>
        {!lockedStatus ? (
          <div className="field">
            <label>{t("commitee.assignment.dialog.statusLabel")}</label>
            <Controller
              name="assignmentStatus"
              control={control}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={statusOptions}
                  placeholder={t(
                    "commitee.assignment.dialog.statusPlaceholder",
                  )}
                  className="w-full"
                  disabled={statusOptions.length === 0}
                />
              )}
            />
          </div>
        ) : (
          <div className="field">
            <label>{t("commitee.assignment.dialog.statusLabel")}</label>
            <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800">
              {t(`commitee.assignment.status.${lockedStatus.toLowerCase()}`)}
            </div>
          </div>
        )}

        {(watchedStatus === "REJECTED" || watchedStatus === "COMPLETED") && (
          <>
            <div className="field">
              <label>{t("commitee.assignment.dialog.commentsLabel")}</label>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => <InputTextarea {...field} rows={4} />}
              />
            </div>

            <div className="field mt-3">
              <FileUploadField
                label={t("commitee.assignment.dialog.uploadReportFile")}
                name="file"
                accept=".pdf,.doc,.docx,.png,.jpg"
                maxFileSize={5000000}
                onFileSelect={(file: any) => setSelectedFile(file)}
              />
            </div>
          </>
        )}

        <div className="flex w-full  justify-end gap-2 mt-4 ">
          <div className="w-24">
            <Button
              label={t("common.cancel")}
              className="p-button-outlined border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md transition-all"
              onClick={onHide}
              type="button"
              icon="pi pi-times"
            />
          </div>
          <div className="w-36">
            <Button
              label={t("common.update")}
              loading={loading}
              type="submit"
              icon="pi pi-save"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-2 rounded-md transition-all shadow-sm"
              disabled={statusOptions.length === 0}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};
