import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import RoleService from "../../../services/role.service";
import { useAppToast } from "../../../hooks/useToast";

interface Permission {
  id: string;
  permissionName: string;
  description?: string;
  category?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  isActive?: boolean;
}

export const ViewDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast } = useAppToast();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Get role data from navigation state if available
  const passedRole = location.state?.role;

  useEffect(() => {
    if (passedRole) {
      setRole(passedRole);
      setLoading(false);
    } else if (id) {
      fetchRoleDetails();
    }
  }, [id, passedRole]);

  const fetchRoleDetails = async () => {
    try {
      setLoading(true);
      const response = await RoleService.getRole(id!);
      setRole(response.data.data);
    } catch (error) {
      console.error("Failed to fetch role details", error);
      showToast("error", "Error", "Failed to load role details");
    } finally {
      setLoading(false);
    }
  };

  // Get permission badge style based on category
  const getPermissionStyle = (permissionName: string) => {
    const colors = [
      {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: "pi-shield",
        dark: "bg-blue-600",
      },
      {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
        icon: "pi-lock",
        dark: "bg-purple-600",
      },
      {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: "pi-check-circle",
        dark: "bg-green-600",
      },
      {
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-200",
        icon: "pi-eye",
        dark: "bg-amber-600",
      },
      {
        bg: "bg-pink-100",
        text: "text-pink-800",
        border: "border-pink-200",
        icon: "pi-users",
        dark: "bg-pink-600",
      },
      {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        border: "border-indigo-200",
        icon: "pi-cog",
        dark: "bg-indigo-600",
      },
    ];

    const index = permissionName.length % colors.length;
    return colors[index];
  };

  // Group permissions by first letter for organization
  const groupedPermissions =
    role?.permissions?.reduce(
      (groups: Record<string, Permission[]>, permission) => {
        const firstLetter = permission.permissionName[0].toUpperCase();
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(permission);
        return groups;
      },
      {},
    ) || {};

  // Sort letters alphabetically
  const sortedLetters = Object.keys(groupedPermissions).sort();

  const breadcrumbItems = [
    { label: "Dashboard", icon: "pi pi-home", url: "/" },
    { label: "Roles", icon: "pi pi-shield", url: "/users/roles" },
    {
      label: role?.name || "Role Details",
      icon: "pi pi-info-circle",
      url: `/users/role/${id}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicBreadcrumb
            items={breadcrumbItems}
            size="pl-5 pr-5 max-w-8xl mx-auto pt-5"
          />

          <div className="mt-6 space-y-6">
            <Card className="shadow-lg rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton
                    shape="circle"
                    size="4rem"
                    className="mr-2"
                  ></Skeleton>
                  <div className="flex-1">
                    <Skeleton
                      width="200px"
                      height="2rem"
                      className="mb-2"
                    ></Skeleton>
                    <Skeleton width="150px" height="1rem"></Skeleton>
                  </div>
                </div>
                <Divider />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton height="100px"></Skeleton>
                  <Skeleton height="100px"></Skeleton>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicBreadcrumb
            items={breadcrumbItems}
            size="pl-5 pr-5 max-w-8xl mx-auto pt-5"
          />

          <div className="mt-6">
            <Card className="shadow-lg rounded-xl overflow-hidden">
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <i className="pi pi-exclamation-triangle text-4xl text-red-500"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Role Not Found
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  The role you're looking for doesn't exist or has been removed.
                </p>
                <Button
                  label="Back to Roles"
                  icon="pi pi-arrow-left"
                  className="bg-linear-to-r from-indigo-500 to-purple-600 border-none"
                  onClick={() => navigate("/users/roles")}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} position="top-right" />

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pb-6">
        <DynamicBreadcrumb
          items={breadcrumbItems}
          size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
        />
        <div className="pl-5 pr-5 max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="bg-linear-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <i className="pi pi-shield text-3xl"></i>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{role.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag
                          value={
                            role.isActive !== false ? "Active" : "Inactive"
                          }
                          severity={
                            role.isActive !== false ? "success" : "danger"
                          }
                          className="text-xs"
                        />
                        <span className="text-sm opacity-90">
                          {role.permissions?.length || 0} Permissions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {role.description && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Description
                      </label>
                      <p className="text-gray-700 mt-1">{role.description}</p>
                    </div>
                  )}

                  <Divider className="my-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">
                        Role ID
                      </span>
                      <span className="text-sm font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-sm">
                        #{role.id}
                      </span>
                    </div>

                    {role.createdAt && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">
                          Created
                        </span>
                        <span className="text-sm text-gray-700">
                          {new Date(role.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}

                    {role.updatedAt && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">
                          Last Updated
                        </span>
                        <span className="text-sm text-gray-700">
                          {new Date(role.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}

                    {role.createdBy && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">
                          Created By
                        </span>
                        <span className="text-sm text-gray-700">
                          {role.createdBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Permissions */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="pi pi-lock text-indigo-500"></i>
                      <h3 className="font-semibold text-gray-700">
                        Assigned Permissions
                      </h3>
                    </div>
                    <Tooltip
                      target=".permission-info"
                      content="All permissions assigned to this role"
                      position="left"
                    />
                    <i className="pi pi-info-circle permission-info text-gray-400 hover:text-indigo-500 cursor-help"></i>
                  </div>
                </div>

                <div className="p-6">
                  {role.permissions && role.permissions.length > 0 ? (
                    <div className="space-y-6">
                      {/* Permission Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-indigo-50 rounded-lg p-3 text-center">
                          <span className="block text-2xl font-bold text-indigo-600">
                            {role.permissions.length}
                          </span>
                          <span className="text-xs text-gray-600">Total</span>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <span className="block text-2xl font-bold text-purple-600">
                            {Object.keys(groupedPermissions).length}
                          </span>
                          <span className="text-xs text-gray-600">
                            Categories
                          </span>
                        </div>
                      </div>

                      {/* Tabs for different views */}
                      <div className="border-b border-gray-200">
                        <div className="flex gap-4">
                          <button
                            className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
                              activeTab === 0
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab(0)}
                          >
                            Grid View
                          </button>
                          <button
                            className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
                              activeTab === 1
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab(1)}
                          >
                            Grouped View
                          </button>
                          <button
                            className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
                              activeTab === 2
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab(2)}
                          >
                            List View
                          </button>
                        </div>
                      </div>

                      {/* Grid View */}
                      {activeTab === 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                          {role.permissions.map((permission) => {
                            const style = getPermissionStyle(
                              permission.permissionName,
                            );
                            return (
                              <div
                                key={permission.id}
                                className="group relative flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-indigo-200"
                              >
                                <div
                                  className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                                >
                                  <i
                                    className={`pi ${style.icon} ${style.text} text-sm`}
                                  ></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                                    {permission.permissionName}
                                  </h4>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Grouped View */}
                      {activeTab === 1 && (
                        <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                          {sortedLetters.map((letter) => (
                            <div key={letter} className="space-y-2">
                              <div className="flex items-center gap-2 sticky top-0 bg-gray-50 p-2 rounded-lg">
                                <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                                  <span className="text-xs font-bold text-indigo-600">
                                    {letter}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-500">
                                  {groupedPermissions[letter].length} permission
                                  {groupedPermissions[letter].length > 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                {groupedPermissions[letter].map(
                                  (permission) => {
                                    const style = getPermissionStyle(
                                      permission.permissionName,
                                    );
                                    return (
                                      <div
                                        key={permission.id}
                                        className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50"
                                      >
                                        <span
                                          className={`w-2 h-2 rounded-full ${style.bg}`}
                                        ></span>
                                        <span className="text-xs text-gray-700">
                                          {permission.permissionName}
                                        </span>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* List View */}
                      {activeTab === 2 && (
                        <div className="space-y-1 max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                          {role.permissions.map((permission, index) => {
                            const style = getPermissionStyle(
                              permission.permissionName,
                            );
                            return (
                              <div
                                key={permission.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                              >
                                <span className="w-6 text-xs text-gray-400">
                                  {index + 1}
                                </span>
                                <span
                                  className={`w-2 h-2 rounded-full ${style.bg}`}
                                ></span>
                                <span className="flex-1 text-sm text-gray-700">
                                  {permission.permissionName}
                                </span>
                                {permission.description && (
                                  <i
                                    className="pi pi-info-circle text-gray-400 hover:text-indigo-500 cursor-help"
                                    title={permission.description}
                                  ></i>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i className="pi pi-lock text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-500 font-medium">
                        No Permissions Assigned
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        This role doesn't have any permissions yet
                      </p>
                      <Button
                        label="Add Permissions"
                        icon="pi pi-plus"
                        className="p-button-text p-button-sm mt-4 text-indigo-600"
                        onClick={() =>
                          navigate(`/roles/edit/${id}`, { state: { role } })
                        }
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDetails;
