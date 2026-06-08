import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAppToast } from "../../../hooks/useToast.js";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
// @ts-ignore
import UserService from "../../../services/user.service.ts";
import { DynamicTable } from "../../../components/common/DynamicTable";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb.js";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../context/AuthContext.tsx";

export const UserList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter] = useState("");
  const { toast, showToast } = useAppToast();
  const { hasPermission, withPermission } = useAuth();
  const navigate = useNavigate();

  // pagination state
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [first, rows]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const page = first / rows;
      const res = await UserService.getPaginatedUsers({
        page,
        size: rows,
        sort: "id,desc",
      });
      setUsers(res.data.data);
      setTotalRecords(res.data.totalElements);
    } catch (error) {
      showToast("error", t("common.error"), t("user.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  };
const translatedRoles = (user: any) =>
  user?.roles
    ?.map((r: any) => t(`role.${r?.name}`))
    .join(", ") || "";
  const roleBodyTemplate = (rowData: any) => {
    if (!rowData.roles || rowData.roles.length === 0) {
      return (
        <span className="text-gray-400 italic text-sm">
          {t("user.labels.noRole")}
        </span>
      );
    }

    return (
      <div className="flex gap-1 flex-wrap">
        {rowData.roles.map((role: any) => {
          const roleName = role.name.replace("ROLE_", "");
          const roleColors: { [key: string]: string } = {
            ADMIN: "bg-red-100 text-red-700 border-red-200",
            MANAGER: "bg-yellow-100 text-yellow-700 border-yellow-200",
            USER: "bg-blue-100 text-blue-700 border-blue-200",
            GUEST: "bg-gray-100 text-gray-700 border-gray-200",
          };
          const colorClass =
            roleColors[roleName] ||
            "bg-purple-100 text-purple-700 border-purple-200";

          return (
            <span
              key={role.id}
              className={`px-2 py-1 text-xs font-medium rounded-full border ${colorClass}`}
            >
              {translatedRoles(rowData)}{" "}
            </span>
          );
        })}
      </div>
    );
  };

  const zoneBodyTemplate = (rowData: any) => {
    if (!rowData.zone || !rowData.zone.name) {
      return (
        <span className="text-gray-400">{t("user.labels.notAssigned")}</span>
      );
    }

    return (
      <span className="text-sm text-gray-700 font-mono">
        {rowData.zone.name}
      </span>
    );
  };

  const dateBodyTemplate = (rowData: any) => {
    if (!rowData.createdDate) return <span className="text-gray-400">{t("common.notSpecified")}</span>;

    const date = new Date(rowData.createdDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-700">{formattedDate}</span>
        <span className="text-xs text-gray-400">{formattedTime}</span>
      </div>
    );
  };

  const phoneBodyTemplate = (rowData: any) => {
    if (!rowData.phoneNumber)
      return (
        <span className="text-gray-400">{t("user.labels.notProvided")}</span>
      );

    return (
      <span className="text-sm text-gray-700 font-mono">
        {rowData.phoneNumber}
      </span>
    );
  };

  const nameBodyTemplate = (rowData: any) => {
    const fullName =
      `${rowData.firstName || ""} ${rowData.lastName || ""}`.trim();

    const initials = fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    const imageUrl = rowData.profileImage
      ? `http://localhost:8080${rowData.profileImage}`
      : null;

    // Generate a consistent color based on the name for the fallback avatar
    const getAvatarColor = (name: string) => {
      const colors = [
        "from-blue-500 to-blue-600",
        "from-purple-500 to-purple-600",
        "from-green-500 to-green-600",
        "from-red-500 to-red-600",
        "from-amber-500 to-amber-600",
        "from-pink-500 to-pink-600",
        "from-indigo-500 to-indigo-600",
        "from-teal-500 to-teal-600",
        "from-orange-500 to-orange-600",
        "from-cyan-500 to-cyan-600",
      ];

      if (!name) return colors[0];

      // Simple hash function to get consistent color for same name
      const hash = name.split("").reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);

      return colors[hash % colors.length];
    };

    return (
      <div className="flex items-center gap-3 p-1 hover:bg-gray-50 rounded-lg transition-colors duration-200">
        <div className="relative">
          {imageUrl ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt={fullName || t("common.notSpecified")}
                className="w-10 h-10 rounded-full border-white shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden",
                  );
                }}
              />
              <div
                className={`hidden absolute inset-0 w-10 h-10 rounded-full bg-linear-to-r ${getAvatarColor(fullName)} flex items-center justify-center text-white text-xs font-semibold shadow-md`}
              >
                {initials || "?"}
              </div>
            </div>
          ) : (
            <div
              className={`w-10 h-10 rounded-full bg-linear-to-r ${getAvatarColor(fullName)} flex items-center justify-center text-white text-sm font-semibold shadow-md`}
            >
              {initials || "?"}
            </div>
          )}
        </div>
        <span className="font-medium text-gray-700 text-sm">
          {fullName || t("common.notSpecified")}
        </span>
      </div>
    );
  };

  const emailBodyTemplate = (rowData: any) => {
    return (
      <span className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
        {rowData.email || t("common.notSpecified")}
      </span>
    );
  };

  const handleEdit = (user: any) => {
    navigate(`/users/edit/${user.id}`);
  };

  const confirmDelete = (user: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4 rounded-8xl">
          <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-200">
            <i className="pi pi-trash text-3xl text-white drop-shadow-lg"></i>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            {t("user.dialogs.deleteTitle")}
          </span>
          <p className="text-gray-600 text-center">
            {t("user.dialogs.deleteConfirm")}{" "}
            <span className="font-semibold">
              {user.firstName} {user.lastName}
            </span>
            ?
          </p>
        </div>
      ),
      header: "",
      acceptLabel: t("user.buttons.delete"),
      rejectLabel: t("common.cancel"),
      acceptClassName: "hidden",
      rejectClassName: "hidden",
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
      await UserService.deleteUser(id);
      showToast(
        "success",
        t("common.success"),
        t("user.messages.deleteSuccess"),
      );
      await loadUsers();
    } catch (error) {
      showToast("error", t("common.error"), t("user.messages.deleteFailed"));
    }
  };

  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      ...withPermission("UPDATE_USER", {
        label: t("user.actions.edit"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      }),

      ...withPermission("DELETE_USER", {
        label: t("user.actions.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      }),

      ...withPermission("VIEW_USER", {
        label: t("user.actions.viewDetails"),
        icon: "pi pi-eye",
        command: () => navigate(`/users/view/${rowData.id}`),
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

  const header = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {t("user.title")}
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {t("user.total")}: {totalRecords}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {hasPermission("ADD_USER") && (
            <Button
              icon="pi pi-plus"
              label={t("user.buttons.create")}
              raised
              severity="info"
              text
              onClick={() => navigate("/users/new")}
            />
          )}

          <Button
            icon="pi pi-sync"
            label={t("common.refresh")}
            text
            severity="info"
            raised
            onClick={loadUsers}
          />
        </div>
      </div>
    );
  };

  const columns = [
    {
      field: "id",
      header: t("user.columns.id"),
      style: { width: "80px" },
      className: "text-sm font-medium text-gray-600",
    },
    {
      header: t("user.columns.name"),
      body: nameBodyTemplate,
      sortable: true,
      sortField: "firstName",
    },
    {
      header: t("user.columns.email"),
      body: emailBodyTemplate,
      sortable: true,
      sortField: "email",
    },
    {
      header: t("user.columns.phoneNumber"),
      body: phoneBodyTemplate,
    },
    {
      header: t("user.columns.roles"),
      body: roleBodyTemplate,
    },
    {
      header: t("user.columns.zone"),
      body: zoneBodyTemplate,
    },
    {
      field: "createdDate",
      header: t("user.columns.createdDate"),
      body: dateBodyTemplate,
      sortable: true,
    },
    {
      header: t("user.columns.actions"),
      body: actionTemplate,
      style: { width: "140px" },
    },
  ];

  const breadcrumbItems = [{ label: t("user.title"), url: "" }];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog className="max-h-5/12" header={false} />
      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />
      <DynamicTable
        title={t("user.title")}
        value={users}
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
        globalFilter={globalFilter}
      />
    </>
  );
};

export default UserList;
