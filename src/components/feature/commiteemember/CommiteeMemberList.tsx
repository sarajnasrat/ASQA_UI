import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useAppToast } from "../../../hooks/useToast";
import { useToast } from "../../../hooks/ToastContext";

import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";

import CommiteeMemberUpdate from "./CommiteeMemberUpdate";
import CommiteeMemberService from "../../../services/commiteeMember.service";
import ExcelExport from "../../common/ExcelExport";
import { useAuth } from "../../../context/AuthContext";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

export const CommiteeMemberList: React.FC = () => {
  const [memberList, setMemberList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const { toast, showToast } = useAppToast();
  const { showError } = useToast();
  const { t } = useTranslation();
  const { hasPermission, withPermission } = useAuth();

  // ================= LOAD =================
  const getAllMembers = async () => {
    setLoading(true);

    const response = await handleApi(
      () =>
        CommiteeMemberService.getAllPaginated({
          page: first / rows,
          size: rows,
          sort: "id,desc",
        }),
      () => {},
      showError,
      t,
    );

    if (response) {
      setMemberList(response.data.data);
      setTotalRecords(response.data.totalElements);
    }

    setLoading(false);
  };

  useEffect(() => {
    getAllMembers();
  }, [first, rows]);

  // ================= CREATE =================

  // ================= UPDATE =================
  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedId(null);
    getAllMembers();
    showToast("success", t("common.success"), t("commitee.member.updated"));
  };

  const handleEdit = (row: any) => {
    setSelectedId(row.id);
    setShowEditDialog(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const response = await handleApi(
      () => CommiteeMemberService.delete(id),
      () =>
        showToast("success", t("common.success"), t("commitee.member.deleted")),
      showError,
      t,
    );

    if (response) {
      getAllMembers();
    }
  };

  const confirmDelete = (row: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <i className="pi pi-trash text-3xl text-white"></i>
          </div>
          <span className="text-lg font-semibold">
            {t("commitee.member.delete")}
          </span>
          <p className="text-center text-gray-600">
            {t("commitee.member.deleteConfirm")}
          </p>
        </div>
      ),
      acceptLabel: t("common.delete"),
      rejectLabel: t("common.cancel"),
      accept: () => handleDelete(row.id),
      closeOnEscape: true,
      dismissableMask: true,
    });
  };

  // ================= ACTION MENU =================
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      ...withPermission("UPDATE_COMMITEEMEMBER", {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      }),
      ...withPermission("DELETE_COMMITEEMEMBER", {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
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

  // ================= HEADER =================
  const header = () => (
    <div className="flex justify-between items-center mb-4 px-2">
      <h2 className="text-2xl font-bold text-blue-700">
        {t("commitee.member.list")}
      </h2>

      <div className="flex gap-3">
        {hasPermission("CREATE_COMMITEEMEMBER") && (
          <Button
            raised
            text
            icon="pi pi-plus"
            label={t("commitee.member.create")}
          />
        )}
        <Button
          raised
          text
          icon="pi pi-refresh"
          label={t("common.refresh")}
          onClick={getAllMembers}
        />
        <ExcelExport
          data={memberList}
          totalElements={totalRecords}
          fileName={t("commitee.member.exportFileName")}
          sheetName={t("commitee.member.exportSheetName")}
          fetchAllData={async () => {
            const res = await CommiteeMemberService.getAllPaginated({
              page: 0,
              size: totalRecords,
              sort: "id,desc",
            });

            return res.data.data;
          }}
        />
      </div>
    </div>
  );

  // ================= COLUMNS =================
  const columns = [
    { field: "id", header: t("common.id"), style: { width: "80px" } },
    {
      field: "user",
      header: t("commitee.member.user"),
      body: (row: any) =>
        `${row.user?.firstName || ""} ${row.user?.lastName || ""}`.trim() ||
        t("common.notSpecified"),
    },
    {
      field: "committee",
      header: t("commitee.name"),
      body: (row: any) => row.committee?.name || t("common.notSpecified"),
    },
    {
      field: "memberRole",
      header: t("commitee.member.role"),
      body: (row: any) =>
        row.memberRole
          ? t(`commitee.member.roles.${row.memberRole}`)
          : t("common.notSpecified"),
    },
    {
      field: "memberDirectorate",
      header: t("commitee.details.memberDirectorate") || "Directorate",
      body: (row: any) => row.memberDirectorate || t("common.notSpecified"),
    },
    {
      field: "position",
      header: t("commitee.details.position") || "Position",
      body: (row: any) => row.position || t("common.notSpecified"),
    },
    {
      field: "responsibility",
      header: t("commitee.member.responsibility"),
      body: (row: any) => row.responsibility || t("common.notSpecified"),
    },
    {
      field: "joinedAt",
      header: t("commitee.member.joinedAt"),
      body: (row: any) =>
        row.joinedAt
          ? IslamicDateFormatter.formatQamari(row.joinedAt)
          : t("common.notSpecified"),
    },
    {
      field: "active",
      header: t("common.active"),
      body: (row: any) =>
        row.active ? t("commitee.Active") : t("commitee.Inactive"),
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "140px" },
    },
  ];

  const breadcrumbItems = [
    { label: t("commitee.member.list"), url: "/commitee-member" },
  ];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      {/* 
            {showCreateDialog && (
                <CommiteeMemberCreate
                    onClose={() => setShowCreateDialog(false)}
                    onSuccess={handleCreateSuccess}
                />
            )} */}

      {showEditDialog && selectedId && (
        <CommiteeMemberUpdate
          commiteeMemberId={selectedId}
          onClose={() => setShowEditDialog(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      <DynamicBreadcrumb items={breadcrumbItems} />

      <DynamicTable
        title={t("commitee.member.list")}
        value={memberList}
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
    </>
  );
};

export default CommiteeMemberList;
