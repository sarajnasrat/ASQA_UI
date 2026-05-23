import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { useForm, Controller } from "react-hook-form";
import RoleService from "../../../services/role.service";
import PermissionService from "../../../services/permission.service";
import { useAppToast } from "../../../hooks/useToast";

interface CreateRoleProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRole: React.FC<CreateRoleProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useAppToast();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (visible) {
      loadPermissions();
    } else {
      reset();
      setSelectedPermissions([]);
      setSearchTerm("");
    }
  }, [visible]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await PermissionService.getAllPermissions();
      setPermissions(res.data || []);
    } catch (error) {
      console.error("Failed to load permissions");
      showToast(
        "error",
        t("common.error"),
        String(t("role.messages.permissionsLoadFailed")),
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: any) => {
    setSelectedPermissions((prev) => {
      const exists = prev.find((p) => p.id === permission.id);
      if (exists) {
        return prev.filter((p) => p.id !== permission.id);
      } else {
        return [...prev, permission];
      }
    });
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(filteredPermissions);
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        permissions: selectedPermissions.map((p) => ({
          id: p.id,
        })),
      };

      await RoleService.registerRole(payload);

      showToast(
        "success",
        t("common.success"),
        String(t("role.messages.createSuccess")),
      );
      reset();
      setSelectedPermissions([]);
      onSuccess();
      onClose();
    } catch (error) {
      showToast(
        "error",
        t("common.error"),
        String(t("role.messages.createFailed")),
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter((p) =>
    p.permissionName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-1 px-1 py-1">
          <i className="pi pi-plus-circle text-2xl text-indigo-500"></i>
          <div>
            <h2 className="text-xl font-bold text-gray-800 m-0">
              {String(t("role.dialogs.createTitle"))}
            </h2>
            <p className="text-sm text-gray-500 m-0 mt-1">
              {String(t("role.dialogs.createSubtitle"))}
            </p>
          </div>
        </div>
      }
      visible={visible}
      onHide={onClose}
      modal
      style={{ width: "70vw", maxWidth: "95vw" }}
      draggable={false}
      resizable={false}
      blockScroll
      className="rounded-xl"
      pt={{
        header: {
          className:
            "border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl",
        },
        content: {
          className: "p-0",
        },
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-1 bg-white rounded-b-xl"
      >
        {/* Role Name Section */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <i className="pi pi-tag text-indigo-500"></i>
            {String(t("role.fields.roleName"))}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Controller
              name="name"
              control={control}
              rules={{
                required: String(t("role.validation.roleNameRequired")),
                minLength: {
                  value: 3,
                  message: String(t("role.validation.roleNameMinLength")),
                },
              }}
              render={({ field }) => (
                <InputText
                  {...field}
                  id="role-name"
                  placeholder={String(t("role.placeholders.roleName"))}
                  className={`
                    w-full pl-10 pr-4 border rounded-lg transition-all
                    focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
                    ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-indigo-300"}
                  `}
                />
              )}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <i className="pi pi-exclamation-circle"></i>
              {String(errors.name.message)}
            </p>
          )}
        </div>

        {/* Permissions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
              <i className="pi pi-lock text-indigo-500"></i>
              {String(t("role.fields.assignPermissions"))}
            </label>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
              {selectedPermissions.length} {String(t("role.labels.of"))}{" "}
              {permissions.length} {String(t("role.labels.selected"))}
            </span>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                placeholder={String(t("role.placeholders.searchPermissions"))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={selectAllPermissions}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                icon="pi pi-check-square"
                label={String(t("role.buttons.all"))}
              />
              <Button
                type="button"
                onClick={deselectAllPermissions}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                icon="pi pi-ban"
                label={String(t("role.buttons.none"))}
              />
            </div>
          </div>

          {/* Permissions Grid - Responsive columns */}
          <div
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-inner"
            style={{ scrollbarWidth: "thin" }}
          >
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  onClick={() => togglePermission(permission)}
                  className={`
                    flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer
                    transition-all duration-200 hover:shadow-md
                    ${
                      selectedPermissions.some((p) => p.id === permission.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-transparent bg-white hover:border-gray-300"
                    }
                  `}
                >
                  <Checkbox
                    inputId={`perm-${permission.id}`}
                    checked={selectedPermissions.some(
                      (p) => p.id === permission.id,
                    )}
                    onChange={() => togglePermission(permission)}
                    className="mt-0.5 shrink-0"
                    pt={{
                      box: {
                        className: `rounded-md w-4 h-4 transition-all ${
                          selectedPermissions.some(
                            (p) => p.id === permission.id,
                          )
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-gray-300"
                        }`,
                      },
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`perm-${permission.id}`}
                      className="block text-xs font-medium text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors truncate"
                      title={t(`permissions.${permission.permissionName}`)}
                    >
                      {t(`permissions.${permission.permissionName}`)}
                    </label>
                    {permission.description && (
                      <p
                        className="text-[10px] text-gray-500 mt-0.5 line-clamp-1"
                        title={permission.description}
                      >
                        {permission.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <i className="pi pi-search text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">
                  {String(t("role.messages.noPermissionsFound"))}
                </p>
                <p className="text-sm text-gray-400">
                  {String(t("role.messages.adjustSearch"))}
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {filteredPermissions.length > 0 && (
            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-4">
              <span>
                <i className="pi pi-filter mr-1"></i>
                {String(t("role.labels.showing"))} {filteredPermissions.length}{" "}
                {String(t("role.labels.of"))} {permissions.length}
              </span>
              <span>
                <i className="pi pi-check-circle mr-1 text-indigo-500"></i>
                {selectedPermissions.length} {String(t("role.labels.selected"))}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            label={String(t("common.cancel"))}
            icon="pi pi-times"
            text
            raised
            severity="secondary"
            type="button"
            onClick={onClose}
            className="
              px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 
              rounded-lg transition-all font-medium
              flex items-center justify-center gap-2
              border border-transparent
              hover:shadow-md
            "
          />
          <Button
            label={String(t("role.buttons.save"))}
            icon="pi pi-save"
            severity="info"
            raised
            text
            type="submit"
            loading={loading}
            disabled={!selectedPermissions.length}
            className="
              px-6 py-3 bg-linear-to-r from-indigo-500 to-indigo-600 
              hover:from-indigo-600 hover:to-indigo-700 
              text-white rounded-lg transition-all font-medium 
              shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
              border border-transparent
            "
          />
        </div>
      </form>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
          <div className="text-center bg-white/90 p-6 rounded-xl shadow-xl">
            <i className="pi pi-spin pi-spinner text-4xl text-indigo-500 mb-3"></i>
            <p className="text-gray-700 font-medium">
              {String(t("role.messages.creatingRole"))}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {String(t("role.messages.pleaseWait"))}
            </p>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CreateRole;
