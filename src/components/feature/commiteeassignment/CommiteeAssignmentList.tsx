import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";

import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";

import CommiteeAssignmentService from "../../../services/commitee-assignment.service";
import { CommiteeAssingmentUpdate } from "./CommiteeAssingmentUpdate";
import StatusTabMenu, { type StatusTabItem } from "../../common/StatusTabMenu";

export const CommiteeAssignmentList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toast = useRef<Toast>(null);
  const { showError, showSuccess } = useToast();

  // ================= STATE =================
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [updateVisible, setUpdateVisible] = useState(false);
  const committeeIds = JSON.parse(localStorage.getItem("committeeIds") || "[]") as number[];
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.roles[0]; // Assuming single role, adjust if multiple roles exist
  console.log("Committee IDs from localStorage:", committeeIds);

    const [status, setStatus] = useState<string>("ASSIGNED");
    const [activeIndex, setActiveIndex] = useState(0);
  // ================= LOAD DATA =================

    const loadData = async () => {
      try {
        setLoading(true);
  
        const res = await CommiteeAssignmentService.getAllPaginatedByStatus(
          status,
          first / rows,
          rows,
          "id,desc",
        );
  
        setData(res.data.data);
        setTotalRecords(res.data.totalElements);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: t("common.error"),
          detail: t("certificationRequest.loadFailed"),
        });
      } finally {
        setLoading(false);
      }
    };
  
// const loadData = async () => {
//   setLoading(true);
//   const response = await handleApi(

//     () =>
      
//       CommiteeAssignmentService.getByCommitteeIds(committeeIds, {
//         page: first / rows,
//         size: rows,
//         sort: "id,desc",
//       }),
//     () => {},
//     showError,
//     t
//   );

//   if (response?.data) {
//     setData(response.data.data);
//     setTotalRecords(response.data.totalElements);
//   }

//   setLoading(false);
// };

  useEffect(() => {
    loadData();
  }, [first, rows,status]);

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const response = await handleApi(
      () => CommiteeAssignmentService.delete(id),
      () => showSuccess("Success", t("common.deleted")),
      showError,
      t
    );

    if (response) loadData();
  };

  const confirmDelete = (row: any) => {
    confirmDialog({
      message: t("common.deleteConfirm"),
      header: t("common.delete"),
      icon: "pi pi-exclamation-triangle",
      accept: () => handleDelete(row.id),
    });
  };

  // ================= ACTION MENU =================
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      // {
      //   label: t("common.view"),
      //   icon: "pi pi-eye",
      //   command: () =>
      //     navigate(`/commitee-assignment/view/${rowData.id}`),
      // },
      // {
      //   label: t("common.edit"),
      //   icon: "pi pi-pencil",
      //   command: () =>
      //     navigate(`/commitee-assignment/edit/${rowData.id}`),
      // },
      {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
      {
  label: t("common.edit"),
  icon: "pi pi-pencil",
  command: () => {
    setSelectedId(rowData.id);
    setUpdateVisible(true);
  },
},
    ];

    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          text
          rounded
          onClick={(e) => menu.current.toggle(e)}
        />
      </div>
    );
  };

  // ================= COLUMNS =================
const columns = [

  // ================= CERTIFICATION REQUEST =================
  {
    field: "certificationRequest",
    header: t("commitee.assignment.requestType"),
    body: (row: any) =>
        t(`certificationRequest.typeOptions.${row.certificationRequest.requestType}`)
   
  },

    {
    field: "certificationRequest",
    header: t("commitee.assignment.certificationType"),
    body: (row: any) =>
       t(`certificationRequest.certificationTypeOptions.${row.certificationRequest.certificationType}`)
       
  },

  // ================= COMMITTEE =================
  {
    field: "committee.name",
    header: t("commitee.name"),
    body: (row: any) => row.committee?.name,
  },

  // ================= ASSIGNED BY =================
  {
    field: "assignedBy",
    header: t("commitee.assignment.assignmentBy"),
    body: (row: any) =>
      row.assignedBy
        ? `${row.assignedBy.firstName} ${row.assignedBy.lastName}`
        : "Not Mentioned",
  },

  // ================= STATUS =================
  {
    field: "assignmentStatus",
    header: t("common.status"),
    body: (row: any) => (
      <Tag
        value={row.assignmentStatus}
        severity={
          row.assignmentStatus === "COMPLETED"
            ? "success"
            : row.assignmentStatus === "REJECTED"
            ? "danger"
            : row.assignmentStatus === "IN_PROGRESS"
            ? "warning"
            : "info"
        }
      />
    ),
  },

  // ================= DATES =================
  {
    field: "assignedAt",
    header: t("commitee.assignment.assignmentAt"),
    body: (row: any) =>
      row.assignedAt ? new Date(row.assignedAt).toLocaleString() : "",
  },



  {
    field: "remarks",
    header: t("commitee.assignment.reason"),
  },

  // ================= ACTION =================
  {
    header: t("common.action"),
    body: actionTemplate,
    style: { width: "140px" },
  },
];

  // ================= HEADER =================
  const header = () => (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-blue-700">
        {t("commitee.assignment.list")}
      </h2>

      <Button
        icon="pi pi-sync"
        label={t("common.refresh")}
        onClick={loadData}
        text
        raised
      />
    </div>
  );
  const statusTabs: StatusTabItem[] = [
    {
      label: t("commitee.assignment.status.assinged"),
      value: "ASSIGNED",
      icon: "pi pi-send",
    },

       {
      label: t("commitee.assignment.status.in_progress"),
      value: "IN_PROGRESS",
      icon: "pi pi-exclamation-circle",
    },

    {
      label: t("commitee.assignment.status.completed"),
      value: "COMPLETED",
      icon: "pi pi-exclamation-circle",
    },
       {
      label: t("commitee.assignment.status.rejected"),
      value: "REJECTED",
      icon: "pi pi-cancel",
    }

 
  ];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <DynamicBreadcrumb
        items={[
          { label: t("commitee.assignment.list"), url: "/commitee-assignment" },
        ]}
      />

            <StatusTabMenu
        items={statusTabs}
        activeIndex={activeIndex}
        onChange={(index, value) => {
          setActiveIndex(index);
          setStatus(value);
          setFirst(0); // reset pagination
        }}
      />
      <CommiteeAssingmentUpdate
  visible={updateVisible}
  assignmentId={selectedId}
  onHide={() => setUpdateVisible(false)}
  onSuccess={() => loadData()}
/>

      <DynamicTable
        title={t("commitee.assignment.list")}
        value={data}
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