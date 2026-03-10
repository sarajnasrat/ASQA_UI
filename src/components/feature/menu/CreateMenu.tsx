import React, { useEffect, useState } from "react";
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

interface CreateMenuProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentMenuId?: string | null;
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

export const CreateMenu: React.FC<CreateMenuProps> = ({
  visible,
  onClose,
  onSuccess,
  parentMenuId = null,
}) => {
  const { showToast } = useAppToast();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [parentMenus, setParentMenus] = useState<any[]>([]);
  const [parentId, setParentId] = useState<string | null>(parentMenuId);
  const [permissionId, setPermissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

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
    if (visible) fetchData();
    else {
      reset();
      setParentId(parentMenuId);
      setPermissionId(null);
    }
  }, [visible]);

  useEffect(() => {
    if (parentMenuId) setParentId(parentMenuId);
  }, [parentMenuId]);

  const fetchData = async () => {
    setFetchingData(true);

    try {
      const [permissionsRes, menusRes] = await Promise.all([
        PermissionService.getAllPermissions(),
        MenuService.getAllMenus(),
      ]);

      setPermissions(permissionsRes.data || []);
      setParentMenus(menusRes.data || []);
    } catch {
      showToast("error", "Error", "Failed to load menus and permissions");
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (data: MenuForm) => {
    setLoading(true);

    try {
      const payload: any = {
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

      await MenuService.registerMenu(payload);

      showToast("success", "Success", "Menu created successfully");

      reset();
      onSuccess();
      onClose();
    } catch {
      showToast("error", "Error", "Failed to create menu");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Dialog Panel */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all">
          
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <i className="pi pi-plus-circle text-indigo-600 text-lg"></i>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New Menu
                </h2>
                <p className="text-sm text-gray-500">
                  Add a new menu item to the navigation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="pi pi-times text-gray-500 text-lg"></i>
            </button>
          </div>

          {/* BODY */}
          {fetchingData ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-sm text-gray-600 font-medium">Loading...</p>
              <p className="text-xs text-gray-400">Please wait while we fetch the data</p>
            </div>
          ) : (
            <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              
              {/* BASIC INFO */}
              <div className="space-y-4">
                {/* <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Basic Information
                  </h3>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* English */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      English Label <span className="text-red-500">*</span>
                    </label>

                    <Controller
                      name="labelEn"
                      control={control}
                      rules={{ required: "English label is required" }}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          className={classNames(
                            "w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all",
                            {
                              "border-red-300 focus:border-red-500": errors.labelEn,
                              "border-gray-200 focus:border-indigo-500": !errors.labelEn,
                            }
                          )}
                          placeholder="e.g., Dashboard"
                        />
                      )}
                    />

                    {errors.labelEn && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <i className="pi pi-exclamation-circle"></i>
                        {errors.labelEn.message}
                      </p>
                    )}
                  </div>

                  {/* Pashto */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Pashto Label
                    </label>

                    <Controller
                      name="labelPs"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="داشبورد"
                          dir="rtl"
                        />
                      )}
                    />
                  </div>

                  {/* Dari */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Dari Label
                    </label>

                    <Controller
                      name="labelDr"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="داشبورد"
                          dir="rtl"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* PATH */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Menu Path <span className="text-red-500">*</span>
                  </label>

                  <Controller
                    name="path"
                    control={control}
                    rules={{ required: "Menu path is required" }}
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
                              "border-red-300 focus:border-red-500": errors.path,
                              "border-gray-200 focus:border-indigo-500": !errors.path,
                            }
                          )}
                          placeholder="dashboard"
                        />
                      </div>
                    )}
                  />

                  {errors.path && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <i className="pi pi-exclamation-circle"></i>
                      {errors.path.message}
                    </p>
                  )}
                </div>
              </div>

              <Divider className="my-6" />

              {/* APPEARANCE */}
              <div className="space-y-4">
                {/* <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Appearance
                  </h3>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Icon
                    </label>

                    <Controller
                      name="icon"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <InputText
                            {...field}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="pi pi-home"
                          />
                          {field.value && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <i className={classNames(field.value, "text-indigo-600")}></i>
                            </div>
                          )}
                        </div>
                      )}
                    />
                    <p className="text-xs text-gray-400">Use PrimeIcons class names</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Sort Order
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
                          incrementButtonClassName="p-button-text"
                          decrementButtonClassName="p-button-text"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.checked)}
                        className="w-5 h-5"
                      />
                    )}
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700 cursor-pointer">
                      Active Menu
                    </label>
                    <p className="text-xs text-gray-400">
                      Inactive menus will be hidden from navigation
                    </p>
                  </div>
                </div>
              </div>

              <Divider className="my-6" />

              {/* HIERARCHY */}
              <div className="space-y-4">
                {/* <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Hierarchy & Permissions
                  </h3>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Menu
                    </label>

                    <Dropdown
                      value={parentId}
                      options={parentMenus}
                      optionLabel="labelEn"
                      optionValue="id"
                      onChange={(e) => setParentId(e.value)}
                      placeholder="Select parent menu"
                      className="w-full"
                      showClear
                      filter
                      panelClassName="shadow-lg border-0"
                    />
                    <p className="text-xs text-gray-400">
                      Leave empty to create a top-level menu
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Required Permission
                    </label>

                    <Dropdown
                      value={permissionId}
                      options={permissions}
                      optionLabel="permissionName"
                      optionValue="id"
                      onChange={(e) => setPermissionId(e.value)}
                      placeholder="Select permission"
                      className="w-full"
                      showClear
                      filter
                      panelClassName="shadow-lg border-0"
                    />
                    <p className="text-xs text-gray-400">
                      Users need this permission to see the menu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={onClose}
            />

            <Button
              label="Create Menu"
              icon="pi pi-check"
              loading={loading}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMenu;