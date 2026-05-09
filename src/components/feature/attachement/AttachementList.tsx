import React, { useEffect, useRef, useState } from "react";
import { useAppToast } from "../../../hooks/useToast";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { DynamicTable } from "../../common/DynamicTable";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import AttachmentService from "../../../services/attachment.service";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import httpClient from "../../../api/httpClient";
import httpClientForPic from "../../../api/httpClientForPic";

export const AttachmentList = () => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const API_BASE_URL = httpClientForPic.getUri(); // ✅ change if needed


  const { toast, showToast } = useAppToast();

  /* ================= LOAD ================= */

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const page = first / rows;
      const response = await AttachmentService.getPaginatedAttachments({
        page,
        size: rows,
        sort: "id,desc",
      });

      const data = response.data.data || [];
      setAttachments(data);
      setTotalRecords(response.data.totalElements || 0);
    } catch (error) {
      console.error(error);
      showToast("error", t("attachment.error"), t("attachment.failed_to_load_attachments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [first, rows]);

  /* ================= DELETE ================= */

  const confirmDelete = (rowData: any) => {
    confirmDialog({
      message: t("attachment.delete_confirmation", { name: rowData.attachmentName }),
      header: t("attachment.delete_header"),
      acceptLabel: t("attachment.delete"),
      rejectLabel: t("attachment.cancel"),
      accept: () => handleDelete(rowData.id),
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await AttachmentService.delete(id);
      showToast("success", t("attachment.success"), t("attachment.attachment_deleted_successfully"));
      loadAttachments();
    } catch {
      showToast("error", t("attachment.error"), t("attachment.delete_failed"));
    }
  };

  /* ================= ACTION MENU ================= */

  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      {
        label: t("attachment.delete"),
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

  /* ================= HELPERS ================= */

  const formatSize = (size: number) =>
    size ? (size / 1024).toFixed(2) + " KB" : "-";

  /* ================= FILE TEMPLATE ================= */


const fileTemplate = (rowData: any) => {
  const fileName =
    rowData.attachmentName ||
    rowData.file ||
    t("attachment.unknown_file");

  // ✅ build full file URL from backend path
  const filePath = rowData.file || rowData.fileUrl || rowData.url || "";
  const fileUrl = filePath ? `${API_BASE_URL}${filePath}` : "#";

  const fileType = (rowData.fileType || "").toLowerCase();
  const fileSize = rowData.fileSize || 0;

  /* ================= FILE ICON ================= */
  const getFileIcon = () => {
    if (fileType.includes("pdf"))
      return { icon: "pi pi-file-pdf", color: "text-red-500", bg: "bg-red-50" };

    if (
      fileType.includes("image") ||
      fileType.includes("jpg") ||
      fileType.includes("png") ||
      fileType.includes("jpeg") ||
      fileType.includes("gif")
    )
      return { icon: "pi pi-image", color: "text-green-500", bg: "bg-green-50" };

    if (fileType.includes("word") || fileType.includes("doc"))
      return { icon: "pi pi-file-word", color: "text-blue-500", bg: "bg-blue-50" };

    if (fileType.includes("excel") || fileType.includes("xls"))
      return {
        icon: "pi pi-file-excel",
        color: "text-green-600",
        bg: "bg-green-50",
      };

    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z"))
      return { icon: "pi pi-box", color: "text-yellow-600", bg: "bg-yellow-50" };

    if (fileType.includes("video"))
      return { icon: "pi pi-video", color: "text-purple-500", bg: "bg-purple-50" };

    if (fileType.includes("audio"))
      return { icon: "pi pi-volume-up", color: "text-pink-500", bg: "bg-pink-50" };

    return { icon: "pi pi-file", color: "text-gray-500", bg: "bg-gray-50" };
  };

  const fileIcon = getFileIcon();

  /* ================= DOWNLOAD FUNCTION ================= */
  const downloadFile = () => {
    if (!fileUrl || fileUrl === "#") return;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= PREVIEW CHECK ================= */
  const canPreview =
    fileType.includes("image") || fileType.includes("pdf");

  /* ================= UI ================= */
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200">
      
      {/* File Icon */}
      <div className={`${fileIcon.bg} p-2 rounded-lg ${fileIcon.color}`}>
        <i className={`${fileIcon.icon} text-lg`} />
      </div>

      {/* File Info */}
      <div className="flex min-w-0">
        
        {/* File Name */}
        <div className="flex items-center gap-2">
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium truncate"
            title={fileName}
          >
            {fileName}
          </a>

          {/* Download Button */}
          <Button
            icon="pi pi-download"
            className="p-button-rounded p-button-text p-button-sm"
            tooltip={t("attachment.download")}
            tooltipOptions={{ position: "top" }}
            onClick={downloadFile}
          />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
            {fileType.toUpperCase() || t("attachment.unknown").toUpperCase()}
          </span>

          <span className="text-xs text-gray-400">•</span>

          <span className="text-xs text-gray-500">
            {formatSize(fileSize)}
          </span>
        </div>
      </div>

      {/* Preview Button */}
      {canPreview && (
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip={t("attachment.preview")}
          tooltipOptions={{ position: "top" }}
          onClick={() => window.open(fileUrl, "_blank")}
        />
      )}
    </div>
  );
};

  /* ================= HEADER ================= */

  const header = () => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-3 items-center">
        <h2 className="text-2xl font-bold text-blue-700">
          {t("attachment.management_title")}
        </h2>

        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
          {t("attachment.total_records", { count: totalRecords })}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Button
          icon="pi pi-plus"
          label={t("attachment.add")}
          raised
          severity="info"
          text
          onClick={() => navigate("/attachments/create")}
        />

        <Button
          icon="pi pi-sync"
          raised
          label={t("attachment.refresh")}
          text
          severity="info"
          onClick={loadAttachments}
        />
      </div>
    </div>
  );

  /* ================= COLUMNS ================= */

  const columns = [
    {
      field: "id",
      header: t("attachment.columns.id"),
      style: { width: "80px" },
    },
    // {
    //   field: "attachmentName",
    //   header: t("attachment.columns.attachment_name"),
    //   sortable: true,
    // },
    {
      field: "referenceType",
      header: t("attachment.columns.module"),
    },
    // {
    //   field: "referenceId",
    //   header: t("attachment.columns.reference_id"),
    // },
    {
      header: t("attachment.columns.file"),
      body: fileTemplate, // Using the fileTemplate function here
      sortable: false,
    },
    
    {
      header: t("attachment.columns.actions"),
      body: actionTemplate,
      style: { width: "120px" },
    },
  ];

  const breadcrumbItems = [
    { label: t("attachment.breadcrumb"), url: "/attachments" },
  ];

  /* ================= UI ================= */

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />

      <DynamicTable
        title={t("attachment.management_title")}
        value={attachments}
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