import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { TieredMenu } from "primereact/tieredmenu";

import CertificationRequestService from "../../../services/CertificationReques.service";

import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { CertificationRequestUpdate } from "./CertificationRequestUpdate";
import type { StatusTabItem } from "../../common/StatusTabMenu";
import type { MenuItem } from "primereact/menuitem";
import StatusTabMenu from "../../common/StatusTabMenu";

export const CertificationRequestList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  // ================= DATA STATE =================
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ================= STATUS STATE =================
  const [status, setStatus] = useState<string>("SUBMITTED");
  const [activeIndex, setActiveIndex] = useState(0);
  //    SUBMITTED,
  //     REGISTERED,
  //     STANDARDS_PROVIDED,
  //     DEADLINE_ASSIGNED,
  //     INSPECTION_IN_PROGRESS,
  //     REPORTED_TO_COMMITTEE,
  //     REPORT_APPROVED,
  //     PAYMENT_PENDING,
  //     PAYMENT_COMPLETED,
  //     CERTIFICATE_ISSUED,
  //     UNDER_SUPERVISION,
  //     REJECTED,
  //     CANCELLED,
  //     DRAFT
  // ================= UPDATE MODAL =================
  const [updateVisible, setUpdateVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ================= TAB ITEMS =================
const statusTabs: StatusTabItem[] = [
  {
    label: t("certificationRequest.statusOptions.SUBMITTED"),
    value: "SUBMITTED",
    icon: "pi pi-send",
  },

  {
    label: t("certificationRequest.statusOptions.UNDER_REVIEW"),
    value: "UNDER_REVIEW",
    icon: "pi pi-search",
  },

  /* ===== STANDARD STEP ===== */

  {
    label: t("certificationRequest.statusOptions.STANDARDS_REQUIRED"),
    value: "STANDARDS_REQUIRED",
    icon: "pi pi-exclamation-circle",
  },

  // {
  //   label: t("certificationRequest.statusOptions.STANDARDS_PROVIDED"),
  //   value: "STANDARDS_PROVIDED",
  //   icon: "pi pi-book",
  // },

  /* ===== DEADLINE STEP ===== */

  {
    label: t("certificationRequest.statusOptions.DEADLINE_REQUIRED"),
    value: "DEADLINE_REQUIRED",
    icon: "pi pi-clock",
  },

  {
    label: t("certificationRequest.statusOptions.DEADLINE_ASSIGNED"),
    value: "DEADLINE_ASSIGNED",
    icon: "pi pi-calendar",
  },

  /* ===== INSPECTION ===== */

  // {
  //   label: t("certificationRequest.statusOptions.INSPECTION_IN_PROGRESS"),
  //   value: "INSPECTION_IN_PROGRESS",
  //   icon: "pi pi-cog",
  // },

  // {
  //   label: t("certificationRequest.statusOptions.REPORTED_TO_COMMITTEE"),
  //   value: "REPORTED_TO_COMMITTEE",
  //   icon: "pi pi-users",
  // },

  {
    label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
    value: "REPORT_APPROVED",
    icon: "pi pi-check-circle",
  },

  /* ===== PAYMENT ===== */

  {
    label: t("certificationRequest.statusOptions.PAYMENT_PENDING"),
    value: "PAYMENT_PENDING",
    icon: "pi pi-credit-card",
  },

  {
    label: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"),
    value: "PAYMENT_COMPLETED",
    icon: "pi pi-wallet",
  },

  /* ===== FINAL ===== */

  // {
  //   label: t("certificationRequest.statusOptions.CERTIFICATE_ISSUED"),
  //   value: "CERTIFICATE_ISSUED",
  //   icon: "pi pi-verified",
  // },

  // {
  //   label: t("certificationRequest.statusOptions.UNDER_SUPERVISION"),
  //   value: "UNDER_SUPERVISION",
  //   icon: "pi pi-eye",
  // },
];

  // ================= LOAD DATA =================
  const loadData = async () => {
    try {
      setLoading(true);

      const res = await CertificationRequestService.getAllPaginatedByStatus(
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

  // ================= EFFECT =================
  useEffect(() => {
    loadData();
  }, [first, rows, status]);

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    try {
      await CertificationRequestService.delete(id);

      toast.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: t("certificationRequest.deleted"),
      });

      loadData();
    } catch {
      toast.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: t("certificationRequest.deleteFailed"),
      });
    }
  };

  const confirmDelete = (row: any) => {
    confirmDialog({
      message: t("certificationRequest.deleteConfirm", {
        serial: row.serialNumber,
      }),
      header: t("certificationRequest.delete"),
      icon: "pi pi-exclamation-triangle",
      accept: () => handleDelete(row.id),
    });
  };

  // ================= ACTION MENU =================

const editButtonLabel = (rowData: any) => {
  if (rowData === "SUBMITTED") {
    return t("certificationRequest.startReview");
  } 
  else if (rowData === "UNDER_REVIEW") {
    return t("certificationRequest.requireStandard");
  } 
  else if (rowData === "STANDARDS_REQUIRED") {
    return t("certificationRequest.providestandard");
  } 
  else if (rowData === "STANDARDS_PROVIDED") {
    return t("certificationRequest.requireDeadline");
  } 
  else if (rowData === "DEADLINE_REQUIRED") {
    return t("certificationRequest.setDeadline");
  } 
  else if (rowData === "DEADLINE_ASSIGNED") {
    return t("certificationRequest.assigneToCommittee");
  } 
  else if (rowData === "INSPECTION_IN_PROGRESS") {
    return t("certificationRequest.continueInspection");
  } 
  else if (rowData === "REPORTED_TO_COMMITTEE") {
    return t("certificationRequest.reviewReport");
  } 
  else if (rowData === "REPORT_APPROVED") {
    return t("certificationRequest.requestPayment");
  } 
  else if (rowData === "PAYMENT_PENDING") {
    return t("certificationRequest.confirmPayment");
  } 
  else if (rowData === "PAYMENT_COMPLETED") {
    return t("certificationRequest.issueCertificate");
  } 
  else if (rowData === "CERTIFICATE_ISSUED") {
    return t("certificationRequest.startSupervision");
  } 
  else {
    return t("common.edit");
  }
};
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => navigate(`/certification-request/view/${rowData.id}`),
      },
      {
        label: editButtonLabel(rowData.requestStatus),
        icon: "pi pi-pencil",
        command: () => {
          setSelectedId(rowData.id);
          setUpdateVisible(true);
        },
      },
      {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
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
    {
      field: "serialNumber",
      header: t("certificationRequest.labels.serialNumber"),
    },
    {
      field: "trackingNumber",
      header: t("certificationRequest.labels.trackingNumber"),
    },
    {
      field: "requestType",
      header: t("certificationRequest.labels.requestType"),
      body: (row: any) =>
        t(`certificationRequest.typeOptions.${row.requestType}`),
    },
    {
      field: "requestStatus",
      header: t("certificationRequest.labels.requestStatus"),
      body: (row: any) => {
        const status = row.requestStatus;

        const getStatusStyle = (status: string) => {
          switch (status) {
            case "DRAFT":
              return "bg-gray-100 text-gray-700 border-gray-300";
            case "SUBMITTED":
              return "bg-blue-100 text-blue-700 border-blue-300";
            case "PENDING":
              return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "APPROVED":
              return "bg-green-100 text-green-700 border-green-300";
            case "REJECTED":
              return "bg-red-100 text-red-700 border-red-300";
            default:
              return "bg-gray-100 text-gray-600 border-gray-300";
          }
        };

        return (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(
              status,
            )}`}
          >
            {t(`certificationRequest.statusOptions.${status}`)}
          </span>
        );
      },
    },
    {
      field: "createdDate",
      header: t("certificationRequest.labels.createdDate"),
      body: (row: any) => new Date(row.createdDate).toLocaleString(),
    },
    {
      header: t("common.action"),
      body: actionTemplate,
    },
  ];

  // ================= HEADER =================
  const header = (
    <div className="flex justify-between">
      <h2>{t("certificationRequest.list")}</h2>

      <div className="flex gap-2">
        {/* <Button
          icon="pi pi-plus"
          label={t("create")}
          onClick={() => navigate("/certification-request/create")}
        /> */}
        <Button
          icon="pi pi-sync"
          label={t("refresh")}
          onClick={loadData}
          text
          raised
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <DynamicBreadcrumb
        items={[{ label: t("certificationRequest.list"), url: "" }]}
      />

      {/* ================= TAB MENU ================= */}
      <StatusTabMenu
        items={statusTabs}
        activeIndex={activeIndex}
        onChange={(index, value) => {
          setActiveIndex(index);
          setStatus(value);
          setFirst(0); // reset pagination
        }}
      />

      {/* ================= TABLE ================= */}
      <DynamicTable
        title={t("certificationRequest.list")}
        value={data}
        columns={columns}
        header={header}
        loading={loading}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
        }}
      />
      <CertificationRequestUpdate
        requestId={selectedId}
        currentStatus={status}
        visible={updateVisible}
        onHide={() => setUpdateVisible(false)}
        onSuccess={loadData}
      />
    </>
  );
};
