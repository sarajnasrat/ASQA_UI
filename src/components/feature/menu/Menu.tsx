import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAppToast } from '../../../hooks/useToast';
import MenuService from '../../../services/menu.service';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import type { MenuItem } from 'primereact/menuitem';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DynamicTable } from '../../common/DynamicTable';
import DynamicBreadcrumb from '../../common/DynamicBreadcrumb';
import { Toast } from 'primereact/toast';
import { CreateMenu } from './CreateMenu';
import { EditMenu } from './EditMenu';

export const Menu = () => {
   const [menuItems, setMenuItems] = React.useState<any[]>([]);
   const [loading, setLoading] = React.useState(true);
    const [showCreateDialog, setShowCreateDialog] = React.useState(false);
    const [editMenuId, setEditMenuId] = React.useState<string>("");
    const [showEditDialog, setShowEditDialog] = React.useState(false);

     const navigate = useNavigate();
const language = localStorage.getItem("lang") || "en";
const labelTemplate = (rowData: any) => {
  if (language === "ps") return rowData.labelPs || rowData.labelEn;
  if (language === "dr") return rowData.labelDr || rowData.labelEn;
  return rowData.labelEn;
};
  // Pagination state
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toast, showToast } = useAppToast();

  const getAllMenus = async () => {
    try {
      setLoading(true);
        const response = await MenuService.getPaginatedMenus({
          page: first / rows,
          size: rows,
          sort: "id,desc",
        });
        setMenuItems(response.data.data);
        setLoading(false);
              setTotalRecords(response.data.totalElements);

    } catch (error) {
      console.error("Failed to load menus", error);
      setLoading(false);
    }
  }

useEffect(() => {
    getAllMenus();
    }, []);

  const handleEdit = (role: any) => {
    setEditMenuId(role.id);
    setShowEditDialog(true);
  };

  const confirmDelete = (user: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4 rounded-8xl">
          <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-200">
            <i className="pi pi-trash text-3xl text-white drop-shadow-lg"></i>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            Delete Menu
          </span>
          <p className="text-gray-600 text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {user.label}
            </span>
            ?
            <br />
          </p>
        </div>
      ),
      header: "",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "hidden", // Hide default button
      rejectClassName: "hidden", // Hide default button
      accept: () => handleDelete(user.id),
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
      await MenuService.deleteMenu(id);
      showToast("success", "Success", "Menu Deleted Successfully");
      await getAllMenus();
    } catch (error) {
      showToast("error", "Error", "Failed to delete menu");
    }
  };
  // Action Menu
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      {
        label: "Edit Menu",
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      },
      {
        label: "Delete Menu",
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
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
             Menu Management
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {totalRecords} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            icon="pi pi-plus"
            label="Create Menu"
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
            onClick={getAllMenus}
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
    header: "Label",
    sortable: true,
    body: labelTemplate,   // ✅ dynamic label
    sortField: "labelEn",  // sorting can use default language
  },
  {
    header: "Path",
    sortable: true,
    field: "path",
    sortField: "path",
  },
  {
    header: "Icon",
    sortable: true,
    field: "icon",
    sortField: "icon",
  },
  {
    header: "Actions",
    body: actionTemplate,
    style: { width: "120px" },
  },
];
  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Menu Management", url: "/menus" },
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
        title="Menu Management"
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

      {/* ✅ Create Role Dialog */}
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
  )
}
