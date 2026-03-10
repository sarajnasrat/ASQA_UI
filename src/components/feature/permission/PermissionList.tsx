import React, { useEffect, useRef, useState } from 'react'
import { useAppToast } from '../../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import PermissionService from '../../../services/permission.service';
import { set } from 'react-hook-form';
import { Button } from 'primereact/button';
import type { MenuItem } from 'primereact/menuitem';
import { TieredMenu } from 'primereact/tieredmenu';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import DynamicBreadcrumb from '../../common/DynamicBreadcrumb';
import { DynamicTable } from '../../common/DynamicTable';
import { CreatePermission } from './CreatePermission';

export const PermissionList = () => {
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast, showToast } = useAppToast();
  const navigate = useNavigate();
  const [first, setFirst] = React.useState(0);
  const [rows, setRows] = React.useState(10);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sortField, setSortField] = React.useState("id");
  const [sortOrder, setSortOrder] = React.useState(-1);
const getAllPermissions = async () => {
    try {
      setLoading(true);
      const res = await PermissionService.getPaginatedPermissions({
        page: first / rows,
        size: rows,
        sort: "id,desc",
      });
      setPermissions(res.data.data);
      setTotalRecords(res.data.totalElements);
      setLoading(false);
    } catch (error) {
         showToast("error", "Error", "Failed to load permissions");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { 
    getAllPermissions();
  }, [first, rows, globalFilter, sortField, sortOrder]);
  
    // Action Menu
    const actionTemplate = (rowData: any) => {
      const menu = useRef<any>(null);
  
      const items: MenuItem[] = [
        {
          label: "View Details",
          icon: "pi pi-eye",
          command: () => navigate(`/permissions/view/${rowData.id}`),
        },
      ];
  
      return (
        <div className="flex justify-center">
          <TieredMenu model={items} popup ref={menu} />
          <Button
            icon="pi pi-ellipsis-v"
            className="p-button-text p-button-sm"
            onClick={(e) => menu.current.toggle(e)}
          />
        </div>
      );
    };
  
    // Header
    const header = () => {
      return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Permission Management
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {totalRecords} Total
            </span>
          </div>
  
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              icon="pi pi-plus"
              label="Create Role"
              raised
              severity="info"
              text
              onClick={() => setShowCreateDialog(true)}
            />
  
            <Button
              icon="pi pi-sync"
              label="Refresh"
              text
              severity="info"
              raised
              onClick={getAllPermissions}
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
        className: "text-sm font-medium text-gray-600",
      },
      {
        header: "Permission Name",
        sortable: true,
        field: "permissionName",
        sortField: "permissionName",
      },
      {
        header: "Actions",
        body: actionTemplate,
        style: { width: "120px" },
      },
    ];
  
    const breadcrumbItems = [
      { label: "Home", url: "/" },
      { label: "Permissions", url: "/users/permissions" },
    ];
  return (

       <>
      <Toast ref={toast} />
      <ConfirmDialog className="max-h-5/12" header={false} />

      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />

      <DynamicTable
        title="Permission Management"
        value={permissions}
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

      {/* ✅ Create Permission Dialog */}
      <CreatePermission
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          getAllPermissions();
          setShowCreateDialog(false);
        }}
      />
    </>
  )
}
