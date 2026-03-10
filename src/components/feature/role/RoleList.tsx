import React, { useEffect, useRef, useState } from "react";
import RoleService from "../../../services/role.service";
import { useAppToast } from "../../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { TieredMenu } from "primereact/tieredmenu";
import { Button } from "primereact/button";
import type { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { CreateRole } from "./CreateRole";
import { EditRole } from "./EditRole";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";

// @ts-ignore
export const RoleList = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  // Pagination state
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toast, showToast } = useAppToast();

  const [editRoleId, setEditRoleId] = useState<string>("");
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    getRoles();
  }, [first, rows]);

  const getRoles = async () => {
    const page = first / rows;

    try {
      setLoading(true);

      const response = await RoleService.getPaginatedRoles({
        page,
        size: rows,
        sort: "id,desc",
      });

      setRoles(response.data.data);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error("Failed to load roles", error);
      showToast("error", "Error", "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: any) => {
    setEditRoleId(role.id);
    setShowEditDialog(true);
  };

  const handleViewDetails = (role: any) => {
    navigate(`/users/role/${role.id}`);
  };

  const confirmDelete = (role: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-xl transform transition-transform hover:scale-110 duration-200">
              <i className="pi pi-trash text-3xl text-white drop-shadow-lg"></i>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xl font-bold text-gray-800 block mb-2">
              Delete Role
            </span>
            <p className="text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                {role.name}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. All permissions associated with this role will be affected.
            </p>
          </div>
        </div>
      ),
      header: "",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "hidden",
      rejectClassName: "hidden",
      accept: () => handleDelete(role.id),
      reject: () => {},
      closeOnEscape: true,
      dismissableMask: true,
      contentStyle: {
        padding: 0,
        overflow: "hidden",
      },
      breakpoints: {
        "960px": "90vw",
        "640px": "95vw",
        "480px": "98vw",
      },
    });
  };

  const handleDelete = async (id: any) => {
    try {
      await RoleService.deleteRole(id);
      showToast("success", "Success", "Role Deleted Successfully");
      await getRoles();
    } catch (error) {
      showToast("error", "Error", "Failed to delete role");
    }
  };

  // Get permission badge color based on permission type/category
  const getPermissionBadgeStyle = (permissionName: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: "pi-shield" },
      { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200", icon: "pi-lock" },
      { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", icon: "pi-check-circle" },
      { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", icon: "pi-eye" },
      { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200", icon: "pi-users" },
      { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200", icon: "pi-cog" },
    ];
    
    // Use permission name to deterministically assign a color
    const index = permissionName.length % colors.length;
    return colors[index];
  };

  // Action Menu
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      {
        label: "Edit Role",
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
        className: "hover:bg-blue-50",
      },
      {
        label: "View Details",
        icon: "pi pi-info-circle",
        command: () => handleViewDetails(rowData),
        className: "hover:bg-purple-50",
      },
      {
        separator: true,
      },
      {
        label: "Delete Role",
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
        className: "hover:bg-red-50 text-red-600",
      },
    ];

    return (
      <div className="flex justify-center">
        <Tooltip target=".action-button" content="Actions" position="top" />
        <TieredMenu model={items} popup ref={menu} className="min-w-[200px] shadow-xl rounded-lg border border-gray-200" />
        <Button
          icon="pi pi-ellipsis-v"
          className="action-button p-button-text p-button-sm w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200"
          onClick={(e) => menu.current.toggle(e)}
          tooltip="Actions"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Enhanced Permissions Cell with expandable view
  const permissionsTemplate = (rowData: any) => {
    const permissions = rowData.permissions || [];
    const isExpanded = expandedRows[rowData.id];
    const displayPermissions = isExpanded ? permissions : permissions.slice(0, 5);
    const remainingCount = permissions.length - 5;

    if (permissions.length === 0) {
      return (
        <Tag value="No Permissions" severity="secondary" className="text-xs" />
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {displayPermissions.map((permission: any, index: number) => {
            const style = getPermissionBadgeStyle(permission.permissionName);
            return (
              <div
                key={permission.id}
                className={`
                  group relative inline-flex items-center gap-1.5 
                  ${style.bg} ${style.text} ${style.border}
                  text-xs font-medium px-2.5 py-1.5 rounded-lg
                  border shadow-sm hover:shadow-md transition-all duration-200
                  cursor-default
                `}
                title={permission.description || permission.permissionName}
              >
                <i className={`pi ${style.icon} text-[10px] opacity-70`}></i>
                <span>{permission.permissionName}</span>
                {permission.description && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap shadow-lg">
                      {permission.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {permissions.length > 5 && (
          <Button
            icon={`pi pi-chevron-${isExpanded ? 'up' : 'down'}`}
            label={isExpanded ? 'Show less' : `+${remainingCount} more`}
            className="p-button-text p-button-sm text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 self-start transition-all duration-200"
            onClick={() => handleViewDetails(rowData)}
            iconPos="right"
          />
        )}
      </div>
    );
  };
// In your table row click handler
const handleRowClick = (rowData: any) => {
  navigate(`/roles/${rowData.id}`, { 
    state: { role: rowData } 
  });
};
  // Header
  const header = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-20"></div>
  
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Role Management
            </h2>
         
          </div>
          <Badge 
            value={totalRecords + " Total"} 
            severity="info" 
            className="ml-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            icon="pi pi-plus"
            text
            severity="info"
            
            label="Create Role"
            raised
            className="bg-linear-to-r from-indigo-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-all duration-200 text-white px-6 py-2"
            onClick={() => setShowCreateDialog(true)}
          />
          <Button
            icon="pi pi-sync"
            label="Refresh"
            text
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-none shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2"
            onClick={getRoles}
          />
        </div>
      </div>
    );
  };

  // Table Columns
  const columns = [
    {
      field: "id",
      header: "ID",
      style: { width: "80px" },
      body: (rowData: any) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg text-sm font-semibold text-gray-700">
          #{rowData.id}
        </span>
      ),
    },
    {
      header: "Role Name",
      field: "name",
      sortField: "name",
      body: (rowData: any) => (
        <div className="flex items-center gap-3">
           <div>
            <span className="font-semibold text-gray-800">{rowData.name}</span>
            <p className="text-xs text-gray-500 mt-0.5">
              {rowData.permissions?.length || 0} permissions
            </p>
          </div>
      
        </div>
      ),
    },
    {
      header: "Permissions",
      field: "permissions",
      body: permissionsTemplate,
      style: { minWidth: "300px" },
    },
    {
      header: "Actions",
      body: actionTemplate,
      style: { width: "120px" },
      headerStyle: { textAlign: 'center' },
    },
  ];

  const breadcrumbItems = [
    { label: "Dashboard", icon: "pi pi-home", url: "/" },
    { label: "Roles", icon: "pi pi-shield", url: "/roles" },
  ];

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog className="max-h-5/12" header={false} />

          <DynamicBreadcrumb
            items={breadcrumbItems}
            size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
          />
         <DynamicTable
        title="Role Management"
        value={roles}
        columns={columns}
        header={header()}
        loading={loading}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
        }}
      />
      <CreateRole
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          getRoles();
          setShowCreateDialog(false);
        }}
      />

      {showEditDialog && (
        <EditRole
          roleId={editRoleId}
          visible={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            getRoles();
            setShowEditDialog(false);
          }}
        />
      )}
    </>
  );
};

export default RoleList;