import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppToast } from "../../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import PermissionService from "../../../services/permission.service";
import { Button } from "primereact/button";
import type { MenuItem } from "primereact/menuitem";
import { TieredMenu } from "primereact/tieredmenu";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { CreatePermission } from "./CreatePermission";
import { useAuth } from "../../../context/AuthContext";

export const PermissionList = () => {
  const { t } = useTranslation();
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast, showToast } = useAppToast();
  const navigate = useNavigate();
  const [first, setFirst] = React.useState(0);
  const [rows, setRows] = React.useState(10);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [globalFilter] = React.useState("");
  const [sortField] = React.useState("id");
  const [sortOrder] = React.useState(-1);
  const { hasPermission, withPermission } = useAuth();

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
    } catch (error) {
      showToast(
        "error",
        t("common.error"),
        String(t("permission.messages.loadFailed")),
      );
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
      ...withPermission("VIEW_PERMISSION", {
        label: String(t("permission.actions.viewDetails")),
        icon: "pi pi-eye",
        command: () => navigate(`/permissions/view/${rowData.id}`),
      }),
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
            {String(t("permission.title"))}
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {totalRecords} {String(t("permission.total"))}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {hasPermission("ADD_PERMISSION") && (
            <Button
              icon="pi pi-plus"
              label={String(t("permission.buttons.create"))}
              raised
              severity="info"
              text
              onClick={() => setShowCreateDialog(true)}
            />
          )}

          <Button
            icon="pi pi-sync"
            label={String(t("common.refresh"))}
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
      header: String(t("permission.columns.id")),
      style: { width: "80px" },
      className: "text-sm font-medium text-gray-600",
    },
    {
      header: String(t("permission.columns.permissionName")),
      sortable: true,
      field: "permissionName",
      sortField: "permissionName",
      body: (rowData: any) => {
        const translatedName = String(
          t(`permissions.${rowData.permissionName}`, rowData.permissionName),
        );

        return (
          <div className="group relative">
            <span className="text-sm text-gray-700 cursor-help border-b border-dotted border-gray-400">
              {translatedName}
            </span>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap shadow-lg">
                {rowData.permissionName}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: String(t("permission.columns.actions")),
      body: actionTemplate,
      style: { width: "120px" },
    },
  ];

  const breadcrumbItems = [
    { label: String(t("nav.home")), url: "/" },
    { label: String(t("permission.title")), url: "/users/permissions" },
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
        title={String(t("permission.title"))}
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

      {/* Create Permission Dialog */}
      <CreatePermission
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          getAllPermissions();
          setShowCreateDialog(false);
        }}
      />
    </>
  );
};

export default PermissionList;
