import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useForm, Controller } from "react-hook-form";
import PermissionService from "../../../services/permission.service";
import { useAppToast } from "../../../hooks/useToast";

interface CreatePermissionProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePermission: React.FC<CreatePermissionProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useAppToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const payload = {
        permissionName: data.permissionName,
      };

      await PermissionService.registerPermission(payload);

      showToast("success", "Success", "Permission created successfully");

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      showToast("error", "Error", "Failed to create permission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Create Permission"
      visible={visible}
      style={{ width: "400px" }}
      modal
      className="p-fluid"
      onHide={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Permission Name */}
        <div>
          <label className="font-semibold">Permission Name</label>
          <Controller
            name="permissionName"
            control={control}
            rules={{ required: "Permission name is required" }}
            render={({ field }) => (
              <InputText
                {...field}
                placeholder="Enter permission name"
                className={errors.permissionName ? "p-invalid w-full" : "w-full"}
              />
            )}
          />
          {errors.permissionName && (
            <small className="p-error">
              {errors.permissionName.message as string}
            </small>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 pt-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            type="button"
            className="p-button-text"
            onClick={onClose}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            type="submit"
            loading={loading}
          />
        </div>
      </form>
    </Dialog>
  );
};
