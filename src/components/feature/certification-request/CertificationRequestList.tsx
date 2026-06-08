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
import { CertificationRequestUpdate } from "./CertificationRequestUpdate";
import type { StatusTabItem } from "../../common/StatusTabMenu";
import type { MenuItem } from "primereact/menuitem";
import StatusTabMenu from "../../common/StatusTabMenu";

import i18n from "../../../i18n/i18n";
import { Download, Eye, File } from "lucide-react";
import ExcelExport from "../../common/ExcelExport";
import { useAuth } from "../../../context/AuthContext";

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
  const { hasPermission, withPermission } = useAuth();
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

    // {
    //   label: t("certificationRequest.statusOptions.UNDER_REVIEW"),
    //   value: "UNDER_REVIEW",
    //   icon: "pi pi-search",
    // },

    /* ===== STANDARD STEP ===== */

    // {
    //   label: t("certificationRequest.statusOptions.STANDARDS_REQUIRED"),
    //   value: "STANDARDS_REQUIRED",
    //   icon: "pi pi-exclamation-circle",
    // },

    // {
    //   label: t("certificationRequest.statusOptions.STANDARDS_PROVIDED"),
    //   value: "STANDARDS_PROVIDED",
    //   icon: "pi pi-book",
    // },

    /* ===== DEADLINE STEP ===== */

    // {
    //   label: t("certificationRequest.statusOptions.DEADLINE_REQUIRED"),
    //   value: "DEADLINE_REQUIRED",
    //   icon: "pi pi-clock",
    // },

    // {
    //   label: t("certificationRequest.statusOptions.DEADLINE_ASSIGNED"),
    //   value: "DEADLINE_ASSIGNED",
    //   icon: "pi pi-calendar",
    // },

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

    // {
    //   label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
    //   value: "REPORT_APPROVED",
    //   icon: "pi pi-check-circle",
    // },
    // {
    //   label: t("certificationRequest.statusOptions.CERTIFICATE_ISSUED"),
    //   value: "CERTIFICATE_ISSUED",
    //   icon: "pi pi-check-circle",
    // },
    // {
    //   label: t("certificationRequest.statusOptions.REJECTED"),
    //   value: "REJECTED",
    //   icon: "pi pi-times",
    // },

    /* ===== PAYMENT ===== */

    // {
    //   label: t("certificationRequest.statusOptions.PAYMENT_PENDING"),
    //   value: "PAYMENT_PENDING",
    //   icon: "pi pi-credit-card",
    // },

    // {
    //   label: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"),
    //   value: "PAYMENT_COMPLETED",
    //   icon: "pi pi-wallet",
    // },

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
    } else if (rowData === "UNDER_REVIEW") {
      return t("certificationRequest.providestandard");
    }else if (rowData === "STANDARDS_PROVIDED") {
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
      ...withPermission("VIEW_CERTIFICATIONREQUEST", {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => navigate(`/certification-request/view/${rowData.id}`),
      }),
      // ...withPermission("UPDATE_CERTIFICATIONREQUEST", {
      //   label: editButtonLabel(rowData.requestStatus),
      //   icon: "pi pi-pencil",
      //   command: () => {
      //     setSelectedId(rowData.id);
      //     setUpdateVisible(true);
      //   },
      // }),
      ...withPermission("DELETE_CERTIFICATION_REQUEST", {
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
    if (bytes === null || bytes === undefined || bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
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
          return <span className="text-gray-400 text-sm">No attachments</span>;
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
                    title="View"
                  >
                    <Eye className="h-3 w-3" />
                  </a>
                  <a
                    href={firstAttachment.filePath || firstAttachment.file}
                    download
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Show badge with number of more attachments */}
              {hasMoreAttachments && (
                <div
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium shadow-sm"
                  title={`${remainingCount} more attachment${remainingCount > 1 ? "s" : ""}`}
                >
                  +{remainingCount}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    // {
    //   field: "attachments",
    //   header: t("certificationRequest.labels.attachments"),
    //   body: (row: any) => {
    //     const [showAllAttachments, setShowAllAttachments] =
    //       React.useState(false);
    //     const attachments = row.attachments || [];

    //     if (attachments.length === 0) {
    //       return <span className="text-gray-400 text-sm">No attachments</span>;
    //     }

    //     const firstAttachment = attachments[0];
    //     const remainingAttachments = attachments.slice(1);
    //     const hasMoreAttachments = attachments.length > 1;

    //     return (
    //       <div className="flex flex-col gap-2">
    //         {/* Show first attachment */}
    //         <div >

    //            <div
    //                 key={firstAttachment.id }
    //                 className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    //               >
    //                 <div className="flex items-center gap-2 flex-1 min-w-0">
    //                   <File className="h-4 w-4 text-blue-500 shrink-0" />
    //                   <div className="flex-1 min-w-0">
    //                     <p className="text-sm font-medium text-gray-900 truncate">
    //                       {firstAttachment.attachmentName || firstAttachment.name}
    //                     </p>
    //                     {firstAttachment.fileSize && (
    //                       <p className="text-xs text-gray-500">
    //                         {formatFileSize(firstAttachment.fileSize)}
    //                       </p>
    //                     )}
    //                   </div>
    //                 </div>
    //                 <div className="flex gap-1 shrink-0">
    //                   <a
    //                     href={firstAttachment.filePath || firstAttachment.file}
    //                     target="_blank"
    //                     rel="noopener noreferrer"
    //                     className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
    //                     title="View"
    //                   >
    //                     <Eye className="h-3 w-3" />
    //                   </a>
    //                   <a
    //                     href={firstAttachment.filePath || firstAttachment.file}
    //                     download
    //                     className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
    //                     title="Download"
    //                   >
    //                     <Download className="h-3 w-3" />
    //                   </a>
    //                 </div>
    //               </div>

    //           {/* Show more button if there are multiple attachments */}
    //           {hasMoreAttachments && (
    //             <button
    //               onClick={() => setShowAllAttachments(!showAllAttachments)}
    //               className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-gray-100 shrink-0"
    //               title={
    //                 showAllAttachments
    //                   ? "Show less"
    //                   : `Show ${attachments.length - 1} more attachment(s)`
    //               }
    //             >
    //               {showAllAttachments ? (
    //                 <EyeOff className="h-4 w-4" />
    //               ) : (
    //                 <Eye className="h-4 w-4" />
    //               )}
    //             </button>
    //           )}
    //         </div>

    //         {/* Show remaining attachments when expanded */}
    //         {showAllAttachments && hasMoreAttachments && (
    //           <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
    //             <p className="text-xs font-medium text-gray-500 mb-1">
    //               {attachments.length - 1} more attachment(s)
    //             </p>
    //             {remainingAttachments.map((attachment: any, index: number) => (
    //               <div
    //                 key={attachment.id || index}
    //                 className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    //               >
    //                 <div className="flex items-center gap-2 flex-1 min-w-0">
    //                   <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
    //                   <div className="flex-1 min-w-0">
    //                     <p className="text-sm font-medium text-gray-900 truncate">
    //                       {attachment.attachmentName || attachment.name}
    //                     </p>
    //                     {attachment.fileSize && (
    //                       <p className="text-xs text-gray-500">
    //                         {formatFileSize(attachment.fileSize)}
    //                       </p>
    //                     )}
    //                   </div>
    //                 </div>
    //                 <div className="flex gap-1 flex-shrink-0">
    //                   <a
    //                     href={attachment.filePath || attachment.file}
    //                     target="_blank"
    //                     rel="noopener noreferrer"
    //                     className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
    //                     title="View"
    //                   >
    //                     <Eye className="h-3 w-3" />
    //                   </a>
    //                   <a
    //                     href={attachment.filePath || attachment.file}
    //                     download
    //                     className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
    //                     title="Download"
    //                   >
    //                     <Download className="h-3 w-3" />
    //                   </a>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   header: t("certificationRequest.labels.deadline"),
    //   body: (row: any) => {
    //     const [showDetails, setShowDetails] = React.useState(false);

    //     const start = row.startDate ? new Date(row.startDate) : null;
    //     const end = row.endDate ? new Date(row.endDate) : null;
    //     const now = new Date();

    //     const calculateMonths = () => {
    //       if (!start || !end) return null;
    //       return (
    //         (end.getFullYear() - start.getFullYear()) * 12 +
    //         (end.getMonth() - start.getMonth())
    //       );
    //     };

    //     const getDaysRemaining = () => {
    //       if (!end) return null;
    //       return Math.ceil(
    //         (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    //       );
    //     };

    //     const daysRemaining = getDaysRemaining();
    //     const totalMonths = calculateMonths();

    //     const getStatusAndColor = () => {
    //       if (!start || !end)
    //         return {
    //           status: "NO DEADLINE",
    //           color: "text-gray-400",
    //           bgColor: "",
    //         };
    //       if (now > end)
    //         return {
    //           status: "EXPIRED",
    //           color: "text-red-600",
    //           bgColor: "bg-red-50",
    //         };
    //       if (daysRemaining !== null && daysRemaining <= 20)
    //         return {
    //           status: "WARNING",
    //           color: "text-orange-600",
    //           bgColor: "bg-orange-50",
    //         };
    //       return {
    //         status: "ACTIVE",
    //         color: "text-green-600",
    //         bgColor: "bg-green-50",
    //       };
    //     };

    //     const { status, color, bgColor } = getStatusAndColor();

    //     return (
    //       <div className="flex flex-col gap-1">
    //         {/* Default view */}
    //         <div className="flex items-center justify-between group">
    //           <span className="text-sm font-semibold text-gray-700">
    //             {totalMonths !== null
    //               ? `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`
    //               : "No duration"}
    //           </span>

    //           <button
    //             onClick={() => setShowDetails(!showDetails)}
    //             className="text-gray-400 hover:text-blue-600 transition-colors"
    //             title={showDetails ? "Hide details" : "Show details"}
    //           >
    //             <button
    //               onClick={() => setShowDetails(!showDetails)}
    //               className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-gray-100"
    //               title={showDetails ? "Hide details" : "Show details"}
    //             >
    //               {showDetails ? (
    //                 <EyeOff className="h-4 w-4" />
    //               ) : (
    //                 <Eye className="h-4 w-4" />
    //               )}
    //             </button>
    //           </button>
    //         </div>

    //         {/* Details on demand */}
    //         {showDetails && (
    //           <div className="space-y-1.5 p-2 bg-gray-50 rounded-md text-xs">
    //             <div
    //               className={`inline-flex items-center px-2 py-0.5 rounded ${bgColor}`}
    //             >
    //               <span className={`font-medium ${color}`}>
    //                 {status === "WARNING"
    //                   ? `⚠️ ${daysRemaining} days left`
    //                   : status === "EXPIRED"
    //                     ? "❌ Expired"
    //                     : status === "ACTIVE"
    //                       ? `✅ ${daysRemaining} days left`
    //                       : "📅 No deadline"}
    //               </span>
    //             </div>
    //             {start && end && (
    //               <>
    //                 <div>
    //                   📅 {start.toLocaleDateString()} →{" "}
    //                   {end.toLocaleDateString()}
    //                 </div>
    //                 {row.batch && <div>🏷️ Batch: {row.batch}</div>}
    //               </>
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
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
          if (!start || !end) return "No deadline";
          if (isExpired) return "Expired";
          if (daysRemaining !== null && daysRemaining <= 20)
            return `${daysRemaining} days remaining`;
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
                Batch: {row.batch}
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
        {/* <Button
          icon="pi pi-plus"
          label={t("create")}
          onClick={() => navigate("/certification-request/create")}
        /> */}
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
          fileName="companies"
          sheetName="Companies"
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
