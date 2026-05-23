import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

      showToast("success", t("common.success"), String(t("permission.messages.createSuccess")));

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      showToast("error", t("common.error"), String(t("permission.messages.createFailed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 px-1 py-1">
          <i className="pi pi-plus-circle text-2xl text-indigo-500"></i>
          <div>
            <h2 className="text-xl font-bold text-gray-800 m-0">
              {String(t("permission.dialogs.createTitle"))}
            </h2>
            {/* <p className="text-sm text-gray-500 m-0 mt-1">
              {String(t("permission.dialogs.createSubtitle"))}
            </p> */}
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "500px", maxWidth: "90vw" }}
      modal
      className="rounded-xl"
      onHide={onClose}
      pt={{
        header: {
          className: "border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl",
        },
        content: {
          className: "p-0",
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6 bg-white rounded-b-xl">
        {/* Permission Name */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <i className="pi pi-tag text-indigo-500"></i>
            {String(t("permission.fields.permissionName"))}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Controller
              name="permissionName"
              control={control}
              rules={{ 
                required: String(t("permission.validation.permissionNameRequired")),
                minLength: {
                  value: 3,
                  message: String(t("permission.validation.permissionNameMinLength"))
                },
                pattern: {
                  value: /^[A-Z_]+$/,
                  message: String(t("permission.validation.permissionNamePattern"))
                }
              }}
              render={({ field }) => (
                <InputText
                  {...field}
                  placeholder={String(t("permission.placeholders.permissionName"))}
                  className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 ${
                    errors.permissionName ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-indigo-300"
                  }`}
                />
              )}
            />
          </div>
          {errors.permissionName && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <i className="pi pi-exclamation-circle"></i>
              {String(errors.permissionName.message)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <i className="pi pi-info-circle"></i>
            {String(t("permission.placeholders.permissionNameHint"))}
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-200">
          <Button
            label={String(t("common.cancel"))}
            icon="pi pi-times"
            text
            raised
            severity="secondary"
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium"
          />
          <Button
            label={String(t("permission.buttons.save"))}
            icon="pi pi-check"
            severity="info"
            text
            raised
            type="submit"
            loading={loading}
            className="px-6 py-3 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
          />
        </div>
      </form>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
          <div className="text-center bg-white/90 p-6 rounded-xl shadow-xl">
            <i className="pi pi-spin pi-spinner text-4xl text-indigo-500 mb-3"></i>
            <p className="text-gray-700 font-medium">{String(t("permission.messages.creatingPermission"))}</p>
            <p className="text-sm text-gray-500 mt-1">{String(t("permission.messages.pleaseWait"))}</p>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CreatePermission;