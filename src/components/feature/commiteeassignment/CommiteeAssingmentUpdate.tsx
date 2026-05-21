import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useForm, Controller } from "react-hook-form";

import CommiteeAssignmentService from "../../../services/commitee-assignment.service";
import FileUploadField from "../../common/FileUploadField";

interface Props {
  visible: boolean;
  onHide: () => void;
  assignmentId: number | null;
  onSuccess: () => void;
}

export const CommiteeAssingmentUpdate: React.FC<Props> = ({
  visible,
  onHide,
  assignmentId,
  onSuccess,
}) => {
  /* ================= FORM ================= */
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      assignmentStatus: "",
      remarks: "",
    },
  });

  const watchedStatus = watch("assignmentStatus");

  /* ================= FILE STATE ================= */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (assignmentId && visible) {
      CommiteeAssignmentService.getById(assignmentId).then((res: any) => {
        const data = res.data.data;

        reset({
          assignmentStatus: data.assignmentStatus,
          remarks: data.remarks,
        });

        setSelectedFile(null);
      });
    }
  }, [assignmentId, visible]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: any) => {
    if (!assignmentId) return;

    try {
      setLoading(true);

      await CommiteeAssignmentService.patchUpdate(
        assignmentId,
        data,
        selectedFile || undefined,
      );

      onSuccess();
      onHide();
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS OPTIONS ================= */
  const statusOptions = [
    { label: "IN_PROGRESS", value: "IN_PROGRESS" },
    { label: "COMPLETED", value: "COMPLETED" },
    { label: "REJECTED", value: "REJECTED" },
  ];

  return (
    <Dialog
      header="Update Assignment"
      visible={visible}
      onHide={onHide}
      style={{ width: "40vw" }}
      modal
      className="rounded-lg shadow-xl"
      pt={{
        header: { className: "bg-gray-50 border-b border-gray-200 text-gray-800 font-semibold p-4" },
        content: { className: "p-6" },
      }}
    >
      <form className="p-fluid" onSubmit={handleSubmit(onSubmit)}>
        {/* ================= STATUS ================= */}
        <div className="field">
          <label>Status</label>

          <Controller
            name="assignmentStatus"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={statusOptions}
                placeholder="Select Status"
                className="w-full"
              />
            )}
          />
        </div>

        {/* ================= REMARKS ================= */}
        {(watchedStatus === "REJECTED" || watchedStatus === "COMPLETED") && (
          <>
            <div className="field">
              <label>Comments</label>

              <Controller
                name="remarks"
                control={control}
                render={({ field }) => <InputTextarea {...field} rows={4} />}
              />
            </div>

            <div className="field mt-3">
              <FileUploadField
                label="Upload Report File"
                name="file"
                accept=".pdf,.doc,.docx,.png,.jpg"
                maxFileSize={5000000}
                onFileSelect={(file: any) => setSelectedFile(file)}
              />
            </div>
          </>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="flex w-3xs justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            className="p-button-outlined border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md transition-all"
            onClick={onHide}
            type="button"
          />

          <Button
            label="Update"
            icon="pi pi-check"
            loading={loading}
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-all shadow-sm"
          />
        </div>
      </form>
    </Dialog>
  );
};