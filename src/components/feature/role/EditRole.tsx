import React, { useEffect, useState } from "react";
import { useAppToast } from "../../../hooks/useToast";
import { RoleService } from "../../../services/role.service";
import { PermissionService } from "../../../services/permission.service";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";

interface EditRoleProps {
  roleId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditRole: React.FC<EditRoleProps> = ({
  roleId,
  visible,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useAppToast();
  const [role, setRole] = useState<any>({});
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load data when dialog opens
  useEffect(() => {
    if (visible) {
      fetchData();
    } else {
      // Reset when dialog closes
      setRole({});
      setSelectedPermissions([]);
      setSearchTerm("");
    }
  }, [visible]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [roleRes, permissionRes] = await Promise.all([
        RoleService.getRole(roleId),
        PermissionService.getAllPermissions(),
      ]);

      const roleData = roleRes.data.data;
      const allPermissions = permissionRes.data;

      setRole(roleData);
      setPermissions(allPermissions);

      // Convert IDs to string for safe comparison
      const selected =
        roleData.permissions?.map((p: any) => String(p.id)) || [];
      setSelectedPermissions(selected);
    } catch (error) {
      showToast("error", "Error", "Failed to load role details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const selectAllPermissions = () => {
    const allPermissionIds = filteredPermissions.map((p) => String(p.id));
    setSelectedPermissions(allPermissionIds);
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        ...role,
        permissions: selectedPermissions
          .map((id) => permissions.find((p) => String(p.id) === id))
          .filter(Boolean),
      };

      await RoleService.updateRole(roleId, payload);

      showToast("success", "Success", "Role updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast("error", "Error", "Failed to update role");
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
        <div className="flex items-center gap-2 px-1 py-1">
          <i className="pi pi-shield text-2xl text-indigo-500"></i>
          <div>
            <h2 className="text-xl font-bold text-gray-800 m-0">
              Edit Role: {role?.name || ""}
            </h2>
            <p className="text-sm text-gray-500 m-0 mt-1">
              Modify role details and permissions
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
            "border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white py-2",
        },
        content: {
          className: "p-0",
        },
      }}
    >
      <div className="flex flex-col gap-2 p-1 bg-white">
        {/* Role Name Section */}
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            <i className="pi pi-tag text-indigo-500"></i>
            Role Name
          </label>
          <div className="relative">
            {/* <i className="pi pi-pencil absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i> */}
            <InputText
              value={role?.name || ""}
              onChange={(e) => setRole({ ...role, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              placeholder="Enter role name (e.g., Admin, Manager, Editor)"
            />
          </div>
          {!role?.name && (
            <p className="text-xs text-amber-600 mt-1">
              <i className="pi pi-exclamation-triangle mr-1"></i>
              Role name is required
            </p>
          )}
        </div>

        {/* Permissions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <i className="pi pi-lock text-indigo-500"></i>
              Assign Permissions
            </label>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
              {selectedPermissions.length} of {permissions.length} selected
            </span>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              {/* <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i> */}
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                placeholder="Search permissions..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={selectAllPermissions}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                icon="pi pi-check-square"
              >
                <span className="hidden sm:inline">All</span>
              </Button>
              <Button
                type="button"
                onClick={deselectAllPermissions}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                icon="pi pi-ban"
              >
                <span className="hidden sm:inline">None</span>
              </Button>
            </div>
          </div>

          {/* Permissions Grid - Responsive columns */}
          <div
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-inner"
            style={{ scrollbarWidth: "thin" }}
          >
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => togglePermission(String(p.id))}
                  className={`
            flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer
            transition-all duration-200 hover:shadow-md
            ${
              selectedPermissions.includes(String(p.id))
                ? "border-indigo-500 bg-indigo-50"
                : "border-transparent bg-white hover:border-gray-300"
            }
          `}
                >
                  <Checkbox
                    inputId={`perm-${p.id}`}
                    checked={selectedPermissions.includes(String(p.id))}
                    onChange={() => togglePermission(String(p.id))}
                    className="mt-0.5 shrink-0"
                    pt={{
                      box: {
                        className: `rounded-md w-4 h-4 transition-all ${
                          selectedPermissions.includes(String(p.id))
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-gray-300"
                        }`,
                      },
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`perm-${p.id}`}
                      className="block text-xs font-medium text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors truncate"
                      title={p.permissionName}
                    >
                      {p.permissionName}
                    </label>
                    {p.description && (
                      <p
                        className="text-[10px] text-gray-500 mt-0.5 line-clamp-1"
                        title={p.description}
                      >
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <i className="pi pi-search text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">No permissions found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your search
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {filteredPermissions.length > 0 && (
            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-4">
              <span>
                <i className="pi pi-filter mr-1"></i>
                Showing {filteredPermissions.length} of {permissions.length}
              </span>
              <span>
                <i className="pi pi-check-circle mr-1 text-indigo-500"></i>
                {selectedPermissions.length} selected
              </span>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            label="Cancel"
            severity="secondary"
            raised
            text
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            icon="pi pi-times"
          />
          <Button
            label="Save"
            severity="info"
            text
            raised
            icon="pi pi-save"
            onClick={handleSubmit}
            loading={loading}
            className="px-6 py-3 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={!role?.name}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
          <div className="text-center">
            <i className="pi pi-spin pi-spinner text-4xl text-indigo-500 mb-3"></i>
            <p className="text-gray-600 font-medium">Updating role...</p>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default EditRole;
