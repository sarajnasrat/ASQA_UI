import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { useForm, Controller } from "react-hook-form";
import { classNames } from "primereact/utils";

import MenuService from "../../../services/menu.service";
import PermissionService from "../../../services/permission.service";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";

interface EditMenuProps {
  menuId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Permission {
  id: string;
  permissionName: string;
}

interface MenuForm {
  labelEn: string;
  labelPs: string;
  labelDr: string;
  path: string;
  icon: string;
  sortOrder: number;
  active: boolean;
}

export const EditMenu: React.FC<EditMenuProps> = ({
  menuId,
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useAppToast();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [parentMenus, setParentMenus] = useState<any[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [permissionId, setPermissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const { showError, showSuccess } = useToast();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuForm>({
    defaultValues: {
      labelEn: "",
      labelPs: "",
      labelDr: "",
      path: "",
      icon: "",
      sortOrder: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (visible && menuId) {
      fetchData();
    }
  }, [visible, menuId]);

  const fetchData = async () => {
    setFetchingData(true);

    try {
      const [menuRes, permissionsRes, menusRes] = await Promise.all([
        MenuService.getMenu(menuId),
        PermissionService.getAllPermissions(),
        MenuService.getAllMenus(),
      ]);

      const menu = menuRes.data?.data || menuRes.data;

      reset({
        labelEn: menu?.labelEn || "",
        labelPs: menu?.labelPs || "",
        labelDr: menu?.labelDr || "",
        path: menu?.path || "",
        icon: menu?.icon || "",
        sortOrder: menu?.sortOrder ?? 0,
        active: menu?.active ?? true,
      });

      setParentId(menu?.parent?.id || menu?.parentId || null);
      setPermissionId(menu?.permission?.id || menu?.permissionId || null);

      setPermissions(permissionsRes.data || []);
      setParentMenus(
        (menusRes.data || []).filter((m: any) => String(m.id) !== String(menuId))
      );
    } catch (error) {
      showToast("error", t("common.error"), t("menu.loadFailed"));
    } finally {
      setFetchingData(false);
    }
  };

const onSubmit = async (data: MenuForm) => {
  setLoading(true);

  try {
    const payload = {
      labelEn: data.labelEn,
      labelPs: data.labelPs,
      labelDr: data.labelDr,
      path: data.path,
      icon: data.icon || "pi pi-circle",
      sortOrder: data.sortOrder,
      active: data.active,
      parentId: parentId || null,
      permissionId: permissionId || null,
    };

    const response = await handleApi(
      () => MenuService.updateMenu(Number(menuId), payload),
   showSuccess,
      showError,
      t
    );

    if (response) {
      onSuccess();
      onClose();
    }
  } finally {
    setLoading(false);
  }
};

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <i className="pi pi-pencil text-indigo-600 text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("menu.editTitle")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("menu.editDescription")}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="pi pi-times text-gray-500 text-lg" />
            </button>
          </div>

          {fetchingData ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-gray-600 font-medium">
                {t("common.loading")}
              </p>
              <p className="text-xs text-gray-400">
                {t("common.pleaseWait")}
              </p>
            </div>
          ) : (
            <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("menu.englishLabel")}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <Controller
                      name="labelEn"
                      control={control}
                      rules={{
                        required: t("menu.validation.englishLabelRequired"),
                      }}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          className={classNames(
                            "w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all",
                            {
                              "border-red-300 focus:border-red-500":
                                errors.labelEn,
                              "border-gray-200 focus:border-indigo-500":
                                !errors.labelEn,
                            }
                          )}
                          placeholder={t("menu.placeholder.englishLabel")}
                        />
                      )}
                    />

                    {errors.labelEn && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.labelEn.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("menu.pashtoLabel")}
                    </label>

                    <Controller
                      name="labelPs"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          dir="rtl"
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder={t("menu.placeholder.pashtoLabel")}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("menu.dariLabel")}
                    </label>

                    <Controller
                      name="labelDr"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          dir="rtl"
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder={t("menu.placeholder.dariLabel")}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("menu.menuPath")} <span className="text-red-500">*</span>
                  </label>

                  <Controller
                    name="path"
                    control={control}
                    rules={{ required: t("menu.validation.pathRequired") }}
                    render={({ field }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          /
                        </span>
                        <InputText
                          {...field}
                          className={classNames(
                            "w-full pl-8 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all",
                            {
                              "border-red-300 focus:border-red-500":
                                errors.path,
                              "border-gray-200 focus:border-indigo-500":
                                !errors.path,
                            }
                          )}
                          placeholder={t("menu.placeholder.path")}
                        />
                      </div>
                    )}
                  />

                  {errors.path && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.path.message}
                    </p>
                  )}
                </div>
              </div>

              <Divider className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("menu.icon")}
                  </label>

                  <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <InputText
                          {...field}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder={t("menu.placeholder.icon")}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <i
                              className={classNames(
                                field.value,
                                "text-indigo-600"
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  />
                  <p className="text-xs text-gray-400">{t("menu.iconHint")}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("menu.sortOrder")}
                  </label>

                  <Controller
                    name="sortOrder"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        value={field.value}
                        onValueChange={(e) => field.onChange(e.value)}
                        className="w-full"
                        min={0}
                        max={999}
                        inputClassName="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        showButtons
                        buttonLayout="horizontal"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-4">
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.checked)}
                    />
                  )}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("menu.activeMenu")}
                  </label>
                  <p className="text-xs text-gray-400">
                    {t("menu.activeMenuHint")}
                  </p>
                </div>
              </div>

              <Divider className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("menu.parentMenu")}
                  </label>

                  <Dropdown
                    value={parentId}
                    options={parentMenus}
                    optionLabel="labelEn"
                    optionValue="id"
                    onChange={(e) => setParentId(e.value)}
                    placeholder={t("menu.placeholder.parentMenu")}
                    className="w-full"
                    showClear
                    filter
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("menu.requiredPermission")}
                  </label>

                  <Dropdown
                    value={permissionId}
                    options={permissions}
                    optionLabel="permissionName"
                    optionValue="id"
                    onChange={(e) => setPermissionId(e.value)}
                    placeholder={t("menu.placeholder.permission")}
                    className="w-full"
                    showClear
                    filter
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <Button
              label={t("common.cancel")}
              icon="pi pi-times"
              className="p-button-text"
              onClick={onClose}
              disabled={loading}
            />

            <Button
              label={t("common.save")}
              icon="pi pi-check"
              loading={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMenu;