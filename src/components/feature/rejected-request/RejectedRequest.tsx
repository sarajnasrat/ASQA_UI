import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { TieredMenu } from "primereact/tieredmenu";

import CertificationRequestService from "../../../services/CertificationReques.service";

import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import type { StatusTabItem } from "../../common/StatusTabMenu";
import type { MenuItem } from "primereact/menuitem";
import StatusTabMenu from "../../common/StatusTabMenu";
import i18n from "../../../i18n/i18n";
import { Download, Eye, File } from "lucide-react";
import { CertificationRequestUpdate } from "../certification-request/CertificationRequestUpdate";
import ExcelExport from "../../common/ExcelExport";

export const RejectedRequest = () => {
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
  const [status, setStatus] = useState<string>("REJECTED");
  const [activeIndex, setActiveIndex] = useState(0);
  // ================= UPDATE MODAL =================
  const [updateVisible, setUpdateVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ================= TAB ITEMS =================
  const statusTabs: StatusTabItem[] = [
    {
      label: t("certificationRequest.statusOptions.REJECTED"),
      value: "REJECTED",
      icon: "pi pi-exclamation-circle",
    },
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
    if (rowData === "STANDARDS_REQUIRED") {
      return t("certificationRequest.providestandard");
    } else if (rowData === "STANDARDS_PROVIDED") {
      return t("certificationRequest.requireDeadline");
    } else if (rowData === "DEADLINE_REQUIRED") {
      return t("certificationRequest.setDeadline");
    } else if (rowData === "DEADLINE_ASSIGNED") {
      return t("certificationRequest.assigneToCommittee");
    } else if (rowData === "INSPECTION_IN_PROGRESS") {
      return t("certificationRequest.continueInspection");
    } else if (rowData === "REPORTED_TO_COMMITTEE") {
      return t("certificationRequest.reviewReport");
    } else if (rowData === "REPORT_APPROVED") {
      return t("certificationRequest.requestPayment");
    } else if (rowData === "PAYMENT_PENDING") {
      return t("certificationRequest.confirmPayment");
    } else if (rowData === "PAYMENT_COMPLETED") {
      return t("certificationRequest.issueCertificate");
    } else if (rowData === "CERTIFICATE_ISSUED") {
      return t("certificationRequest.startSupervision");
    } else {
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
  const getCompanyNameField = () => {
    const lang = i18n.language; // or your language state
    switch (lang) {
      case "dr":
        return "companyNameDR";
      case "ps":
        return "companyNamePS";
      default:
        return "companyNameEN";
    }
  };
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (bytes === null || bytes === undefined || bytes === 0)
      return t("certificationRequest.fileSize.zero");

    const sizes = [
      t("certificationRequest.fileSize.bytes"),
      t("certificationRequest.fileSize.kb"),
      t("certificationRequest.fileSize.mb"),
      t("certificationRequest.fileSize.gb"),
      t("certificationRequest.fileSize.tb"),
    ];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      header: t("company.labels.companyName"),
      body: (row: any) => row.company?.[getCompanyNameField()] || "-",
    },
    {
      field: "attachments",
      header: t("certificationRequest.labels.attachments"),
      body: (row: any) => {
        const attachments = row.attachments || [];

        if (attachments.length === 0) {
          return (
            <span className="text-gray-400 text-sm">
              {t("certificationRequest.labels.noAttachments")}
            </span>
          );
        }

        const firstAttachment = attachments[0];
        const remainingCount = attachments.length - 1;
        const hasMoreAttachments = attachments.length > 1;

        return (
          <div className="flex flex-col gap-2">
            {/* Show first attachment */}
            <div className="relative">
              <div
                key={firstAttachment.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {firstAttachment.attachmentName || firstAttachment.name}
                    </p>
                    {firstAttachment.fileSize && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(firstAttachment.fileSize)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <a
                    href={firstAttachment.filePath || firstAttachment.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title={t("common.view")}
                  >
                    <Eye className="h-3 w-3" />
                  </a>
                  <a
                    href={firstAttachment.filePath || firstAttachment.file}
                    download
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title={t("common.download")}
                  >
                    <Download className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Show badge with number of more attachments */}
              {hasMoreAttachments && (
                <div
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium shadow-sm"
                  title={t("certificationRequest.labels.moreAttachments", {
                    count: remainingCount,
                  })}
                >
                  +{remainingCount}
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    {
      header: t("certificationRequest.labels.deadline"),
      body: (row: any) => {
        const start = row.startDate ? new Date(row.startDate) : null;
        const end = row.endDate ? new Date(row.endDate) : null;
        const now = new Date();

        const calculateMonths = () => {
          if (!start || !end) return null;
          return (
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth())
          );
        };

        const getDaysRemaining = () => {
          if (!end) return null;
          return Math.ceil(
            (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
        };

        const daysRemaining = getDaysRemaining();
        const totalMonths = calculateMonths();
        const isExpired = now > end!;

        const getStatusText = () => {
          if (!start || !end)
            return t("certificationRequest.deadline.noDeadline");
          if (isExpired) return t("certificationRequest.deadline.expired");
          if (daysRemaining !== null && daysRemaining <= 20)
            return t("certificationRequest.deadline.daysRemaining", {
              count: daysRemaining,
            });
          // return `${daysRemaining} days left`;
        };

        const getStatusColor = () => {
          if (!start || !end) return "text-gray-400";
          if (isExpired) return "text-red-600";
          if (daysRemaining !== null && daysRemaining <= 20)
            return "text-orange-600";
          return "text-green-600";
        };

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {totalMonths !== null ? `${totalMonths} months` : "—"}
              </span>
              <span className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            {start && end && (
              <div className="text-xs text-gray-400">
                {start.toLocaleDateString()} → {end.toLocaleDateString()}
              </div>
            )}
            {isExpired && row.batch && (
              <div className="text-xs text-red-600 font-medium mt-1">
                {t("certificationRequest.deadline.batch", { batch: row.batch })}
              </div>
            )}
          </div>
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
        <Button
          icon="pi pi-sync"
          label={t("common.refresh")}
          onClick={loadData}
          text
          raised
        />
        <ExcelExport
          data={data}
          totalElements={totalRecords}
          fileName={t("certificationRequest.list")}
          sheetName={t("certificationRequest.list")}
          fetchAllData={async () => {
            const res =
              await CertificationRequestService.getAllPaginatedByStatus(
                status,
                first / rows,
                rows,
                "id,desc",
              );

            return res.data.data;
          }}
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
