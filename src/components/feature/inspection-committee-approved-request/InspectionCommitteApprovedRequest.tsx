import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { TieredMenu } from "primereact/tieredmenu";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";

import CertificationRequestService from "../../../services/CertificationReques.service";
import { handleApi } from "../../../hooks/handleApi";

import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";

import type { StatusTabItem } from "../../common/StatusTabMenu";
import type { MenuItem } from "primereact/menuitem";
import StatusTabMenu from "../../common/StatusTabMenu";

import i18n from "../../../i18n/i18n";
import { Download, Eye, File } from "lucide-react";
import { CertificationRequestUpdate } from "../certification-request/CertificationRequestUpdate";
import ExcelExport from "../../common/ExcelExport";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

const ActionMenu = ({ items }: { items: MenuItem[] }) => {
  const menu = useRef<any>(null);

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

const formatQamariDate = (value?: string | Date | null, showTime = false) =>
  value ? IslamicDateFormatter.formatQamari(value, showTime) : "-";

export const InspectionCommitteApprovedRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const showSuccess = (summary: string, detail?: string) => {
    toast.current?.show({
      severity: "success",
      summary,
      detail,
    });
  };

  const showError = (summary: string, detail?: string) => {
    toast.current?.show({
      severity: "error",
      summary,
      detail,
    });
  };

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [status, setStatus] = useState<string>("COMMITTEE_APPROVED");
  const [activeIndex, setActiveIndex] = useState(0);

  const [updateVisible, setUpdateVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [uploadedBill, setUploadedBill] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [uploading, setUploading] = useState(false);
  const [printedRequests, setPrintedRequests] = useState<number[]>([]);

  const statusTabs: StatusTabItem[] = [
    {
      label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
      value: "REPORT_APPROVED",
      icon: "pi pi-credit-card",
    },

  ];

  const loadData = async () => {
    setLoading(true);

    const res = await handleApi(
      () =>
        CertificationRequestService.getAllPaginatedByStatus(
          status,
          first / rows,
          rows,
          "id,desc"
        ),
      () => {},
      showError,
      t
    );

    if (res) {
      setData(res.data.data);
      setTotalRecords(res.data.totalElements);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [first, rows, status]);

  const getCompanyNameField = () => {
    const lang = i18n.language;

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
    if (bytes === null || bytes === undefined || bytes === 0) return t("certificationRequest.fileSize.zero");

    const sizes = [t("certificationRequest.fileSize.bytes"), t("certificationRequest.fileSize.kb"), t("certificationRequest.fileSize.mb"), t("certificationRequest.fileSize.gb"), t("certificationRequest.fileSize.tb")];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

 

  const openPaymentDialog = (request: any) => {
    setSelectedRequest(request);
    setUploadedBill(null);
    setTransactionId("");
    setPaymentDate("");
    setPaymentAmount(request.paymentAmount || "");
    setPaymentDialogVisible(true);
  };

  const toPaymentDateTime = (date: string) => {
    if (!date) return new Date().toISOString();
    if (date.includes("T")) return date;

    return new Date(`${date}T00:00:00`).toISOString();
  };

  const handlePaymentConfirmation = async () => {
    if (!selectedRequest) return;

    if (!uploadedBill) {
      toast.current?.show({
        severity: "warn",
        summary: t("common.warning"),
        detail: t("certificationRequest.payment.uploadScannedBillRequired"),
      });
      return;
    }

    if (!transactionId.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: t("common.warning"),
        detail: t("certificationRequest.payment.enterTransactionId"),
      });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", uploadedBill);
    formData.append("transactionId", transactionId);
    formData.append("paymentDate", toPaymentDateTime(paymentDate));
    formData.append(
      "paymentAmount",
      paymentAmount || selectedRequest.paymentAmount || ""
    );

    const response = await handleApi(
      () =>
        CertificationRequestService.confirmPayment(
          selectedRequest.id,
          formData
        ),
      () =>
        showSuccess(
          t("common.success"),
          t("certificationRequest.payment.scannedBillUploaded")
        ),
      showError,
      t
    );

    if (response) {
      await handleApi(
        () => CertificationRequestService.updateIsScanned(selectedRequest.id, true),
        () => {},
        showError,
        t,
      );

      setPaymentDialogVisible(false);
      setUploadedBill(null);
      setTransactionId("");
      setPaymentDate("");
      setPaymentAmount("");
      setSelectedRequest(null);

      loadData();
    }

    setUploading(false);
  };

  const downloadPaymentReceipt = async (requestId: number) => {
    const resp = await handleApi(
      () => CertificationRequestService.getPaymentReceipt(requestId),
      () => {},
      showError,
      t
    );

    if (resp && resp.data) {
      const blob = resp.data;
      const url = window.URL.createObjectURL(new Blob([blob]));
      window.open(url, "_blank");
    }
  };

  const handleDelete = async (id: number) => {
    const response = await handleApi(
      () => CertificationRequestService.delete(id),
      () =>
        showSuccess(
          t("common.success"),
          t("certificationRequest.deleted")
        ),
      showError,
      t
    );

    if (response) {
      loadData();
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

  const actionTemplate = (rowData: any) => {
    const items: MenuItem[] = [
      {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () =>
          navigate(`/certification-request/view/${rowData.id}`, {
            state: {
              originPath: "/approved-request",
              activeSidebarPath: "/approved-request",
            },
          }),
      },
    ];

    if (rowData.requestStatus === "PAYMENT_PENDING") {
      // Always allow printing. Show upload only after printed (or if backend flag indicates printed)
      items.push({
        label: t("certificationRequest.printBill") || "Print Bill",
        icon: "pi pi-print",
        // command: () => printBill(rowData),
      });

      const hasPrintedFlag =
        rowData.isPrint || rowData.isPrinted || printedRequests.includes(rowData.id);

      if (rowData.isScanned) {
        items.push({
          label: t("certificationRequest.paymentCompleted") || "Payment Completed",
          icon: "pi pi-check-circle",
          command: () => openPaymentDialog(rowData),
        });
      } else if (hasPrintedFlag) {
        items.push({
          label: t("certificationRequest.uploadScannedBill") || "Upload Scanned Bill",
          icon: "pi pi-upload",
          command: () => openPaymentDialog(rowData),
        });
      }

      items.push({
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      });
    }

    if (rowData.requestStatus === "PAYMENT_COMPLETED") {
      items.push({
        label: t("certificationRequest.viewPaymentDetails") || "View Payment Details",
        icon: "pi pi-eye",
        command: () => openPaymentDialog(rowData),
      });
    }

    return <ActionMenu items={items} />;
  };

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
      header: t("certificationRequest.labels.certificationType"),
      body: (row: any) => t(`certificationRequest.certificationTypeOptions.${row.certificationType}`) || "-",
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
          return <span className="text-gray-400 text-sm">{t("certificationRequest.labels.noAttachments")}</span>;
        }

        const firstAttachment = attachments[0];
        const remainingCount = attachments.length - 1;
        const hasMoreAttachments = attachments.length > 1;

        return (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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

              {hasMoreAttachments && (
                <div
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium shadow-sm"
                  title={`${remainingCount} more attachment${
                    remainingCount > 1 ? "s" : ""
                  }`}
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
            (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        };

        const daysRemaining = getDaysRemaining();
        const totalMonths = calculateMonths();
        const isExpired = end ? now > end : false;

        const getStatusText = () => {
          if (!start || !end) return t("certificationRequest.deadline.noDeadline");
          if (isExpired) return t("certificationRequest.deadline.expired");
          if (daysRemaining !== null && daysRemaining <= 15) {
            return t("certificationRequest.deadline.daysRemaining", { count: daysRemaining });
          }
          return "";
        };

        const getStatusColor = () => {
          if (!start || !end) return "text-gray-400";
          if (isExpired) return "text-red-600";
          if (daysRemaining !== null && daysRemaining <= 15) {
            return "text-orange-600";
          }
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
                {IslamicDateFormatter.formatQamariRange(start, end, " → ")}
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
      body: (row: any) => formatQamariDate(row.createdDate, true),
    },
    {
      header: t("common.action"),
      body: actionTemplate,
    },
  ];

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
          fileName={t("certificationRequest.payment.title")}
          sheetName={t("certificationRequest.payment.title")}
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

  const paymentDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label={t("common.cancel")}
        icon="pi pi-times"
        onClick={() => setPaymentDialogVisible(false)}
        className="p-button-text"
      />

      {selectedRequest?.requestStatus === "PAYMENT_PENDING" && !selectedRequest?.isScanned && (
        <Button
          label={uploading ? t("certificationRequest.payment.uploading") : t("certificationRequest.payment.uploadScan")}
          icon="pi pi-upload"
          onClick={handlePaymentConfirmation}
          loading={uploading}
        />
      )}
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <DynamicBreadcrumb
        items={[{ label: t("certificationRequest.list"), url: "" }]}
      />

      <StatusTabMenu
        items={statusTabs}
        activeIndex={activeIndex}
        onChange={(index, value) => {
          setActiveIndex(index);
          setStatus(value);
          setFirst(0);
        }}
      />

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

      <Dialog
        header={
          selectedRequest?.requestStatus === "PAYMENT_PENDING" && !selectedRequest?.isScanned
            ? t("certificationRequest.payment.uploadScannedBill")
            : t("certificationRequest.payment.details")
        }
        visible={paymentDialogVisible}
        style={{ width: "720px" }}
        footer={paymentDialogFooter}
        onHide={() => setPaymentDialogVisible(false)}
      >
        {selectedRequest && (
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                ${t("certificationRequest.requestInfo")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500">
                    ${t("certificationRequest.labels.serialNumber")}
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedRequest.serialNumber || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-500">
                    ${t("certificationRequest.labels.trackingNumber")}
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedRequest.trackingNumber || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-500">{t("company.labels.companyName")}</span>
                  <span className="font-medium text-gray-900">
                    {selectedRequest.company?.[getCompanyNameField()] || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-500">{t("certificationRequest.labels.requestStatus")}</span>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      selectedRequest.requestStatus === "PAYMENT_COMPLETED" || selectedRequest.isScanned
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedRequest.requestStatus === "PAYMENT_COMPLETED" || selectedRequest.isScanned
                      ? t("certificationRequest.statusOptions.PAYMENT_COMPLETED")
                      : t("certificationRequest.statusOptions.PAYMENT_PENDING")}
                  </span>
                </div>
              </div>
            </div>

            {selectedRequest.requestStatus === "PAYMENT_PENDING" && !selectedRequest.isScanned && (
              <div className="rounded-lg border border-blue-100 bg-white p-4">
                <h3 className="mb-3 text-base font-semibold text-gray-800">
                  ${t("certificationRequest.payment.scanUploadInfo")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("certificationRequest.payment.transactionId")} *
                    </label>
                    <InputText
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder={t("certificationRequest.payment.enterTransactionIdPlaceholder")}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("certificationRequest.payment.paymentDate")}
                    </label>
                    <InputText
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("certificationRequest.payment.paymentAmount")}
                    </label>
                    <InputText
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={t("certificationRequest.payment.enterPaidAmount")}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("certificationRequest.payment.scannedBill")} *
                    </label>
                    <FileUpload
                      name="bill"
                      mode="basic"
                      accept="image/*,application/pdf"
                      maxFileSize={5000000}
                      chooseLabel={uploadedBill ? t("certificationRequest.payment.changeFile") : t("certificationRequest.payment.chooseFile")}
                      auto={false}
                      customUpload
                      onSelect={(e) => setUploadedBill(e.files[0])}
                      onClear={() => setUploadedBill(null)}
                      className="w-full"
                    />

                    {uploadedBill && (
                      <div className="mt-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        {t("certificationRequest.payment.selectedFile")}: {uploadedBill.name}
                      </div>
                    )}

                    <small className="mt-1 block text-gray-500">
                      {t("certificationRequest.payment.fileTypesHint")}
                    </small>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                  {t("certificationRequest.payment.uploadNote")}
                </div>
              </div>
            )}

            {(selectedRequest.requestStatus === "PAYMENT_COMPLETED" || selectedRequest.isScanned) && (
              <div className="rounded-lg border border-green-100 bg-white p-4 text-sm text-gray-900">
                <h3 className="mb-3 text-base font-semibold text-gray-800">{t("certificationRequest.payment.details")}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500">{t("certificationRequest.payment.transactionId")}</span>
                    <span className="font-medium text-gray-900">{selectedRequest.transactionId || "-"}</span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-500">{t("certificationRequest.payment.paymentDate")}</span>
                    <span className="font-medium text-gray-900">{formatQamariDate(selectedRequest.paymentDate)}</span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-500">{t("certificationRequest.payment.paymentAmount")}</span>
                    <span className="font-medium text-gray-900">{selectedRequest.paymentAmount || "-"}</span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-500">{t("certificationRequest.payment.scannedBill")}</span>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => downloadPaymentReceipt(selectedRequest.id)}
                        className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                      >
                        {t("common.view") || "View"}
                      </button>

                      <a
                        href={selectedRequest.paymentReceiptUrl || selectedRequest.receiptFilePath || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 rounded-md text-sm ${selectedRequest.paymentReceiptUrl || selectedRequest.receiptFilePath ? 'bg-gray-100 text-gray-800' : 'text-gray-400'}`}
                      >
                        {t("common.download") || "Download"}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  {t("certificationRequest.payment.completedNote")}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
};
