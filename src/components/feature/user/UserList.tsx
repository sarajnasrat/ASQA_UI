import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { Password } from "primereact/password";
import { useNavigate } from "react-router-dom";
import { useAppToast } from "../../../hooks/useToast.js";
import { handleApi } from "../../../hooks/handleApi";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
// @ts-ignore
import UserService from "../../../services/user.service.ts";
import { DynamicTable } from "../../../components/common/DynamicTable";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb.js";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../context/AuthContext.tsx";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import { SmartDatePicker } from "../../common/datepicker/SmartDatePicker";
import RoleService from "../../../services/role.service";
import { UserRegistration } from "./UserRegistration";
import { EditUser } from "./EditUser";

export const UserList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter] = useState("");
  const { toast, showToast } = useAppToast();
  const { hasPermission, withPermission } = useAuth();
  const navigate = useNavigate();
  const [resetUser, setResetUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [userDialog, setUserDialog] = useState<"create" | "edit" | null>(null);
  const [editingUserId, setEditingUserId] = useState<number>();

  const showSuccess = (summary: string, detail?: string) =>
    showToast("success", summary, detail || "");
  const showError = (summary: string, detail?: string) =>
    showToast("error", summary, detail || "");

  // pagination state
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchFilters, setSearchFilters] = useState({ keyword: "", roles: [] as string[], startDate: "", endDate: "" });
  const [roleOptions, setRoleOptions] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, [first, rows, searchFilters]);

  useEffect(() => {
    RoleService.getAllRoles()
      .then((response) => {
        const roles = response.data?.data || response.data || [];
        setRoleOptions(roles
          .filter((item: any) => !["INSPECTION_USERS", "ROLE_INSPECTION_USERS"].includes(item.name?.toUpperCase()))
          .map((item: any) => ({
          label: t(`user.roles.${item.name?.replace(/^ROLE_/, "")}`) || item.name,
          value: item.name,
          })));
      })
      .catch(() => showToast("error", t("common.error"), t("user.messages.roleLoadFailed")));
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const page = first / rows;
      const params = {
        page,
        size: rows,
        sort: "id,desc",
        ...(searchFilters.keyword && { keyword: searchFilters.keyword }),
        ...(searchFilters.roles.length > 0 && { roles: searchFilters.roles }),
        ...(searchFilters.startDate && { startDate: `${searchFilters.startDate}T00:00:00` }),
        ...(searchFilters.endDate && { endDate: `${searchFilters.endDate}T23:59:59` }),
      };
      const hasFilters = Boolean(
        searchFilters.keyword || searchFilters.roles.length ||
        searchFilters.startDate || searchFilters.endDate,
      );
      const res = hasFilters
        ? await UserService.searchUsers(params)
        : await UserService.getPaginatedUsers(params);
      setUsers(res.data.data);
      setTotalRecords(res.data.totalElements);
    } catch (error) {
      showToast("error", t("common.error"), t("user.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    setFirst(0);
    setSearchFilters({ keyword: keyword.trim(), roles, startDate, endDate });
  };

  const clearSearch = () => {
    setKeyword("");
    setRoles([]);
    setStartDate("");
    setEndDate("");
    setFirst(0);
    setSearchFilters({ keyword: "", roles: [], startDate: "", endDate: "" });
  };

  const toIsoDateString = (value: any): string => {
    if (!value) return "";
    const rawDate = value?.toDate?.() ?? value?.date ?? value;
    const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const translatedRoles = (user: any) =>
    user?.roles?.map((r: any) => t(`role.${r?.name}`)).join(", ") || "";
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
    if (!rowData.createdDate)
      return <span className="text-gray-400">{t("common.notSpecified")}</span>;

    const formattedDate = IslamicDateFormatter.formatQamari(
      rowData.createdDate,
    );
    const formattedTime =
      IslamicDateFormatter.getTime(rowData.createdDate) || "-";

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
    setEditingUserId(user.id);
    setUserDialog("edit");
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

  const openResetPassword = (user: any) => {
    setResetUser(user);
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;
    if (newPassword.length < 6) {
      showToast(
        "warn",
        t("common.warning"),
        t("user.resetPassword.passwordTooShort"),
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast(
        "warn",
        t("common.warning"),
        t("user.resetPassword.passwordMismatch"),
      );
      return;
    }

    setResettingPassword(true);
    const response = await handleApi(
      () =>
        UserService.resetUserPassword(resetUser.id, {
          newPassword,
          confirmNewPassword,
        }),
      showSuccess,
      showError,
      t,
    );

    if (response) {
      setResetUser(null);
    }
    setResettingPassword(false);
  };

  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      ...withPermission("UPDATE_USER", {
        label: t("user.actions.edit"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      }),

      ...withPermission("UPDATE_USER", {
        label: t("user.resetPassword.action"),
        icon: "pi pi-key",
        command: () => openResetPassword(rowData),
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
      <div className="mb-4 space-y-4 px-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              onClick={() => setUserDialog("create")}
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
   <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 shadow-sm">
  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
      <i className="pi pi-search" />
    </span>
    {t("user.search.title")}
  </div>
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-600">
        {t("user.search.nameOrEmail")}
      </label>
      <input 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)} 
        placeholder={t("user.search.keywordPlaceholder")} 
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
      />
    </div>
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-600">
        {t("user.fields.role")}
      </label>
      <MultiSelect
        value={roles}
        options={roleOptions}
        onChange={(e) => setRoles(e.value || [])}
        placeholder={t("user.search.rolePlaceholder")}
        display="chip"
        maxSelectedLabels={2}
        selectedItemsLabel={t("common.itemsSelected")}
        className="w-full rounded-xl border border-slate-200 text-sm shadow-sm"
        panelClassName="rounded-xl shadow-xl"
      />
    </div>
    <SmartDatePicker
      value={startDate}
      onChange={(date) => setStartDate(toIsoDateString(date))}
      calendarType="persian"
      label={t("user.search.startDate")}
      className="text-sm"
      inputClassName="px-3 py-2 text-sm"
      labelClassName="mb-1 block text-xs font-semibold text-slate-600"
    />
    <SmartDatePicker
      value={endDate}
      onChange={(date) => setEndDate(toIsoDateString(date))}
      calendarType="persian"
      label={t("user.search.endDate")}
      className="text-sm"
      inputClassName="px-3 py-2 text-sm"
      labelClassName="mb-1 block text-xs font-semibold text-slate-600"
    />
    <div className="flex items-end gap-2">
      <Button 
        label={t("user.search.button")} 
        icon="pi pi-search" 
        onClick={applySearch} 
        className="h-9.5 flex-none rounded-xl border-0 bg-blue-700 px-4 py-2 text-sm shadow-sm hover:bg-blue-800" 
      />
      <Button 
        icon="pi pi-filter-slash" 
        text 
        onClick={clearSearch} 
        tooltip={t("user.search.clear")} 
        tooltipOptions={{ position: "top" }} 
        className="h-9.5 w-9.5 rounded-xl text-slate-500 hover:bg-slate-100" 
      />
    </div>
  </div>
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
      <Dialog
        header={t("user.resetPassword.title")}
        visible={Boolean(resetUser)}
        modal
        className="w-[min(92vw,40rem)] overflow-hidden rounded-3xl border-0 shadow-2xl"
        headerClassName="border-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-5 text-white"
        contentClassName="bg-gradient-to-b from-gray-50 to-white px-6 py-6"
        onHide={() => !resettingPassword && setResetUser(null)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <Button
              label={t("common.cancel")}
              outlined
              onClick={() => setResetUser(null)}
              disabled={resettingPassword}
              className="w-full rounded-xl border-2 border-gray-300 bg-white/80 px-6 py-3 font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:border-gray-400 hover:bg-gray-100 hover:shadow-md sm:w-auto"
            />
            <Button
              label={t("user.resetPassword.button")}
              icon="pi pi-key"
              onClick={handleResetPassword}
              loading={resettingPassword}
              className="w-full rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
            />
          </div>
        }
      >
        <div className="min-w-0 space-y-6 sm:min-w-[320px]">
          {/* User Info Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white">
                {`${resetUser?.firstName?.[0] || ""}${resetUser?.lastName?.[0] || ""}`.toUpperCase() ||
                  "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-gray-800">
                  {resetUser?.firstName} {resetUser?.lastName}
                </p>
                <p className="truncate text-sm font-medium text-gray-500">
                  {resetUser?.email}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <i className="pi pi-shield text-xl text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Info Alert */}
          {/* <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <i className="pi pi-info-circle text-amber-600" />
            </div>
            <p className="text-sm font-medium leading-6 text-amber-800">
              {t("user.resetPassword.title")}
            </p>
          </div> */}

          {/* Password Fields */}
          <div className="space-y-5">
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <i className="pi pi-lock text-indigo-500" />
                {t("user.fields.password")}
              </label>
              <Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("user.placeholders.password")}
                toggleMask
                feedback={false}
                className="w-full"
                inputClassName="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-4 pr-10 text-gray-700 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <i className="pi pi-check-circle text-purple-500" />
                {t("user.fields.confirmPassword")}
              </label>
              <Password
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={t("user.placeholders.confirmPassword")}
                toggleMask
                feedback={false}
                inputClassName="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-4 pr-10 text-gray-700 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Password Requirements Hint */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-blue-700">
              <i className="pi pi-shield text-blue-500" />
              Password must be at least 8 characters with letters and numbers
            </p>
          </div>
        </div>
      </Dialog>
      {userDialog === "create" && (
        <UserRegistration onClose={() => setUserDialog(null)} onSaved={loadUsers} />
      )}
      {userDialog === "edit" && editingUserId && (
        <EditUser userId={editingUserId} onClose={() => setUserDialog(null)} onSaved={loadUsers} />
      )}
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
