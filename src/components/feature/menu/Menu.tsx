import React, { useEffect, useRef, useState } from "react";
import { useAppToast } from "../../../hooks/useToast";
import MenuService from "../../../services/menu.service";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DynamicTable } from "../../common/DynamicTable";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { Toast } from "primereact/toast";
import { CreateMenu } from "./CreateMenu";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { EditMenu } from "./EditMenu";

export const Menu = () => {
  const { t, i18n } = useTranslation();

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editMenuId, setEditMenuId] = useState<string>("");
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { hasPermission, withPermission } = useAuth();

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const { toast, showToast } = useAppToast();

  const getMenuLabel = (menu: any) => {
    switch (i18n.language) {
      case "ps":
        return menu?.labelPs || menu?.labelEn || "";
      case "dr":
        return menu?.labelDr || menu?.labelEn || "";
      default:
        return menu?.labelEn || "";
    }
  };

  const labelTemplate = (rowData: any) => getMenuLabel(rowData);

  const getAllMenus = async () => {
    try {
      setLoading(true);

      const response = await MenuService.getPaginatedMenus({
        page: first / rows,
        size: rows,
        sort: "id,desc",
      });

      setMenuItems(response.data.data);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      showToast("error", t("common.error"), t("menu.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllMenus();
  }, [rows, first]);

  const handleDelete = async (id: any) => {
    try {
      await MenuService.deleteMenu(id);
      showToast("success", t("common.success"), t("menu.deleteSuccess"));
      await getAllMenus();
    } catch (error) {
      showToast("error", t("common.error"), t("menu.deleteFailed"));
    }
  };

  const confirmDelete = (rowData: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4 rounded-8xl">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <i className="pi pi-trash text-3xl text-white drop-shadow-lg" />
          </div>

          <span className="text-lg font-semibold text-gray-800">
            {t("menu.deleteTitle")}
          </span>

          <p className="text-gray-600 text-center">
            {t("menu.deleteConfirm")}{" "}
            <span className="font-semibold">{getMenuLabel(rowData)}</span>?
          </p>
        </div>
      ),
      header: "",
      acceptLabel: t("common.delete"),
      rejectLabel: t("common.cancel"),
      acceptClassName: "hidden",
      rejectClassName: "hidden",
      accept: () => handleDelete(rowData.id),
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
  const handleEdit = (row: any) => {
    setEditMenuId(row.id);
    setShowEditDialog(true);
  };
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      ...withPermission("DELETE_MENU", {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      }),
      ...withPermission("UPDATE_MENU", {
        label: t("common.update"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      }),
    ];

    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-text p-button-sm"
          onClick={(e) => menu.current?.toggle(e)}
        />
      </div>
    );
  };

  const header = () => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          {t("menu.management")}
        </h2>

        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
          {totalRecords} {t("menu.total")}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {hasPermission("ADD_MENU") && (
          <Button
            icon="pi pi-plus"
            label={t("menu.create")}
            raised
            severity="info"
            text
            onClick={() => setShowCreateDialog(true)}
          />
        )}

        <Button
          icon="pi pi-sync"
          label={t("common.refresh")}
          text
          severity="info"
          raised
          onClick={getAllMenus}
        />
      </div>
    </div>
  );

  const columns = [
    {
      field: "id",
      header: t("menu.columns.id"),
      style: { width: "80px" },
      className: "text-sm font-medium text-gray-600",
    },
    {
      header: t("menu.columns.label"),
      body: labelTemplate,
      sortField: "labelEn",
    },
    {
      header: t("menu.columns.path"),
      field: "path",
      sortField: "path",
    },
    {
      header: t("menu.columns.icon"),
      field: "icon",
      sortField: "icon",
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "120px" },
    },
  ];

  const breadcrumbItems = [
    { label: t("nav.home"), url: "/" },
    { label: t("menu.breadcrumb"), url: "/menus" },
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
        key={i18n.language}
        title={t("menu.management")}
        value={menuItems}
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

      <CreateMenu
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          getAllMenus();
          setShowCreateDialog(false);
        }}
      />

      {showEditDialog && (
        <EditMenu
          menuId={editMenuId}
          visible={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            getAllMenus();
            setShowEditDialog(false);
          }}
        />
      )}
    </>
  );
};
