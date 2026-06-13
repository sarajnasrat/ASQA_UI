import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { useTranslation } from "react-i18next";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";

import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";

import { CommiteeCreate } from "../commitee/CommiteeCreate";
import { CommiteeUpdate } from "../commitee/CommiteeUpdate";
import CommiteeService from "../../../services/comitee.service";
import { useToast } from "../../../hooks/ToastContext";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import CommiteeMemberCreate from "../commiteemember/CommiteeMemberCreate";
import ExcelExport from "../../common/ExcelExport";
import { useAuth } from "../../../context/AuthContext";

export const CommiteeList: React.FC = () => {
  const [commiteeList, setCommiteeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMemberCreateDialog, setShowMemberCreateDialog] = useState(false);
  const [selectedCommitteeForMember, setSelectedCommitteeForMember] = useState<
    number | null
  >(null);

  const navigate = useNavigate();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCommiteeId, setSelectedCommiteeId] = useState<number | null>(
    null,
  );

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toast, showToast } = useAppToast();
  const { showError } = useToast();
  const { t } = useTranslation();
  const { hasPermission, withPermission } = useAuth();

  // ================= LOAD DATA =================
  const getAllCommitees = async () => {
    setLoading(true);

    const response = await handleApi(
      () =>
        CommiteeService.getAllPaginated({
          page: first / rows,
          size: rows,
          sort: "id,desc",
        }),
      () => {},
      showError,
      t,
    );

    if (response) {
      setCommiteeList(response.data.data);
      setTotalRecords(response.data.totalElements);
    }

    setLoading(false);
  };

  useEffect(() => {
    getAllCommitees();
  }, [first, rows]);

  // ================= CREATE =================
  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    getAllCommitees();
  };

  // ================= UPDATE =================
  const handleEditSuccess = () => {
    setShowEditDialog(false);
    getAllCommitees();
    showToast("success", t("common.success"), t("commitee.updated"));
  };

  // ================= EDIT =================
  const handleEdit = (row: any) => {
    setSelectedCommiteeId(row.id);
    setShowEditDialog(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const response = await handleApi(
      () => CommiteeService.delete(id),
      () => showToast("success", t("common.success"), t("commitee.deleted")),
      showError,
      t,
    );

    if (response) {
      getAllCommitees();
    }
  };

  // ================= CONFIRM DELETE =================
  const confirmDelete = (row: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <i className="pi pi-trash text-3xl text-white"></i>
          </div>
          <span className="text-lg font-semibold">{t("commitee.delete")}</span>
          <p className="text-center text-gray-600">
            {t("commitee.deleteConfirm", { name: row.name || t("common.notSpecified") })}
          </p>
        </div>
      ),
      acceptLabel: t("commitee.delete"),
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
      ...withPermission("UPDATE_COMMITEE", {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      }),
      ...withPermission("DELETE_COMMITEE", {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      }),
      ...withPermission("VIEW_COMMITEE", {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => navigate(`/commitee/view/${rowData.id}`),
      }),
      ...withPermission("ADD_COMMITEEMEMBER", {
        label: t("commitee.createMember"),
        icon: "pi pi-plus",
        command: () => {
          setSelectedCommitteeForMember(rowData.id);
          setShowMemberCreateDialog(true);
        },
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
      <h2 className="text-2xl font-bold text-blue-700">{t("commitee.list")}</h2>

      <div className="flex gap-3">
        {hasPermission("ADD_COMMENT") && (
          <Button
            text
            raised
            icon="pi pi-plus"
            label={t("commitee.create")}
            onClick={() => setShowCreateDialog(true)}
          />
        )}
        <Button
          icon="pi pi-sync"
          label={t("common.refresh")}
          onClick={getAllCommitees}
          text
          raised
        />
        <ExcelExport
          data={commiteeList}
          totalElements={totalRecords}
          fileName="committees"
          sheetName="committees"
          fetchAllData={async () => {
            const res = await CommiteeService.getAllPaginated({
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
    {
      field: "name",
      header: t("commitee.name"),
    },
    {
      field: "description",
      header: t("commitee.description"),
    },
    {
      field: "memberCount",
      header: t("commitee.memberCount"),
    },
    {
      field: "memberCount",
      header: t("commitee.memberCount"),
    },

    {
      field: "committeeType",
      header: t("commitee.commiteeType"),
    },
    {
      field: "active",
      header: t("common.status"),
      body: (rowData: any) => (
        <Tag
          value={rowData.active ? t("commitee.active") : t("commitee.inactive")}
          severity={rowData.active ? "success" : "danger"}
        />
      ),
    },
    {
      field: "createdDate",
      header: t("common.createdDate"),
      body: (rowData: any) =>
        rowData.createdDate
          ? IslamicDateFormatter.formatQamari(rowData.createdDate, true)
          : "",
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "140px" },
    },
  ];

  const breadcrumbItems = [{ label: t("commitee.list"), url: "/commitee" }];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      {showMemberCreateDialog && (
        <CommiteeMemberCreate
          committeeId={selectedCommitteeForMember}
          onClose={() => setShowMemberCreateDialog(false)}
          onSuccess={() => {
            setShowMemberCreateDialog(false);
            getAllCommitees();
          }}
        />
      )}
      {showCreateDialog && (
        <CommiteeCreate
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditDialog && selectedCommiteeId && (
        <CommiteeUpdate
          commiteeId={selectedCommiteeId}
          onClose={() => setShowEditDialog(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      <DynamicBreadcrumb items={breadcrumbItems} />

      <DynamicTable
        title={t("commitee.list")}
        value={commiteeList}
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
