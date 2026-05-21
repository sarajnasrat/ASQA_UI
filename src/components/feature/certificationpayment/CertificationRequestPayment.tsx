import React, { useEffect, useRef, useState } from "react";
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

export const CertificationRequestPayment = () => {
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

  const [status, setStatus] = useState<string>("PAYMENT_PENDING");
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

  const statusTabs: StatusTabItem[] = [
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
    if (bytes === null || bytes === undefined || bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const editButtonLabel = (requestStatus: string) => {
    if (requestStatus === "SUBMITTED") {
      return t("certificationRequest.startReview");
    } else if (requestStatus === "UNDER_REVIEW") {
      return t("certificationRequest.requireStandard");
    } else if (requestStatus === "STANDARDS_REQUIRED") {
      return t("certificationRequest.providestandard");
    } else if (requestStatus === "STANDARDS_PROVIDED") {
      return t("certificationRequest.requireDeadline");
    } else if (requestStatus === "DEADLINE_REQUIRED") {
      return t("certificationRequest.setDeadline");
    } else if (requestStatus === "DEADLINE_ASSIGNED") {
      return t("certificationRequest.assigneToCommittee");
    } else if (requestStatus === "INSPECTION_IN_PROGRESS") {
      return t("certificationRequest.continueInspection");
    } else if (requestStatus === "REPORTED_TO_COMMITTEE") {
      return t("certificationRequest.reviewReport");
    } else if (requestStatus === "REPORT_APPROVED") {
      return t("certificationRequest.requestPayment");
    } else if (requestStatus === "PAYMENT_PENDING") {
      return t("certificationRequest.confirmPayment");
    } else if (requestStatus === "PAYMENT_COMPLETED") {
      return t("certificationRequest.issueCertificate");
    } else if (requestStatus === "CERTIFICATE_ISSUED") {
      return t("certificationRequest.startSupervision");
    } else {
      return t("common.edit");
    }
  };

  const printBill = (request: any) => {
    if (request.requestStatus !== "PAYMENT_PENDING") {
      toast.current?.show({
        severity: "warn",
        summary: t("common.warning"),
        detail: "Bill can be printed only when payment is pending.",
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const billContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Bill - ${request.serialNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            margin: 0;
          }
          .bill-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 30px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .bill-title {
            font-size: 28px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .details-table td,
          .details-table th {
            padding: 12px;
            border: 1px solid #ddd;
          }
          .details-table th {
            background-color: #f5f5f5;
            font-weight: bold;
            width: 40%;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: right;
            margin-top: 20px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .payment-instructions {
            margin-top: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #007bff;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <div class="company-name">Certification Authority</div>
            <div>Payment Invoice / Bill</div>
          </div>

          <div class="bill-title">PAYMENT INVOICE</div>

          <table class="details-table">
            <tr>
              <th>Serial Number</th>
              <td>${request.serialNumber || "-"}</td>
            </tr>
            <tr>
              <th>Tracking Number</th>
              <td>${request.trackingNumber || "-"}</td>
            </tr>
            <tr>
              <th>Company Name</th>
              <td>${request.company?.[getCompanyNameField()] || "-"}</td>
            </tr>
            <tr>
              <th>Request Type</th>
              <td>${t(`certificationRequest.typeOptions.${request.requestType}`)}</td>
            </tr>
            <tr>
              <th>Payment Amount</th>
              <td>${request.paymentAmount || "To be determined"}</td>
            </tr>
            <tr>
              <th>Payment Status</th>
              <td>Pending</td>
            </tr>
          </table>

          <div class="payment-instructions">
            <strong>Payment Instructions:</strong><br/>
            Please transfer the amount to the following bank account:<br/>
            Bank: ABC Bank<br/>
            Account Name: Certification Authority<br/>
            Account Number: 1234567890<br/>
            IBAN: IBAN123456789<br/>
            SWIFT/BIC: ABCDEF123<br/>
            Reference: ${request.serialNumber || "-"}
          </div>

          <div class="amount">
            Total Amount: ${request.paymentAmount || "Contact support"}
          </div>

          <div class="footer">
            This is a system generated invoice. For any queries, please contact support.<br/>
            Generated on: ${new Date().toLocaleString()}
          </div>
        </div>

        <div class="no-print" style="text-align:center; margin-top:20px;">
          <button onclick="window.print()" style="padding:10px 20px; font-size:16px;">
            Print Bill
          </button>
          <button onclick="window.close()" style="padding:10px 20px; font-size:16px; margin-left:10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(billContent);
    printWindow.document.close();
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
        detail: "Please upload the scanned bill.",
      });
      return;
    }

    if (!transactionId.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: t("common.warning"),
        detail: "Please enter transaction ID.",
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
          "Scanned bill uploaded successfully."
        ),
      showError,
      t
    );

    if (response) {
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
    ];

    if (rowData.requestStatus === "PAYMENT_PENDING") {
      items.push(
        {
          label: "Print Bill",
          icon: "pi pi-print",
          command: () => printBill(rowData),
        },
        {
          label: "Upload Scanned Bill",
          icon: "pi pi-upload",
          command: () => openPaymentDialog(rowData),
        },
        {
          label: t("common.delete"),
          icon: "pi pi-trash",
          command: () => confirmDelete(rowData),
        }
      );
    }

    if (rowData.requestStatus === "PAYMENT_COMPLETED") {
      items.push({
        label: "View Payment Details",
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
          if (!start || !end) return "No deadline";
          if (isExpired) return "Expired";
          if (daysRemaining !== null && daysRemaining <= 20) {
            return `${daysRemaining} days remaining`;
          }
          return "";
        };

        const getStatusColor = () => {
          if (!start || !end) return "text-gray-400";
          if (isExpired) return "text-red-600";
          if (daysRemaining !== null && daysRemaining <= 20) {
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

  const header = (
    <div className="flex justify-between">
      <h2>{t("certificationRequest.list")}</h2>

      <div className="flex gap-2">
        <Button
          icon="pi pi-sync"
          label={t("refresh")}
          onClick={loadData}
          text
          raised
        />
         <ExcelExport
          data={data}
          totalElements={totalRecords}
          fileName="payments"
          sheetName="payments"
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
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setPaymentDialogVisible(false)}
        className="p-button-text"
      />

      {selectedRequest?.requestStatus === "PAYMENT_PENDING" && (
        <Button
          label={uploading ? "Uploading..." : "Upload Scan"}
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
          selectedRequest?.requestStatus === "PAYMENT_PENDING"
            ? "Upload Scanned Bill"
            : "Payment Details"
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
                Request Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500">
                    Serial Number
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedRequest.serialNumber || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-500">
                    Tracking Number
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedRequest.trackingNumber || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-500">Company</span>
                  <span className="font-medium text-gray-900">
                    {selectedRequest.company?.[getCompanyNameField()] || "-"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-500">Status</span>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      selectedRequest.requestStatus === "PAYMENT_COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedRequest.requestStatus === "PAYMENT_COMPLETED"
                      ? "Payment Completed"
                      : "Payment Pending"}
                  </span>
                </div>
              </div>
            </div>

            {selectedRequest.requestStatus === "PAYMENT_PENDING" && (
              <div className="rounded-lg border border-blue-100 bg-white p-4">
                <h3 className="mb-3 text-base font-semibold text-gray-800">
                  Scan Upload Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Transaction ID *
                    </label>
                    <InputText
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Payment Date
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
                      Payment Amount
                    </label>
                    <InputText
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter paid amount"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Scanned Bill *
                    </label>
                    <FileUpload
                      name="bill"
                      mode="basic"
                      accept="image/*,application/pdf"
                      maxFileSize={5000000}
                      chooseLabel={uploadedBill ? "Change File" : "Choose File"}
                      auto={false}
                      customUpload
                      onSelect={(e) => setUploadedBill(e.files[0])}
                      onClear={() => setUploadedBill(null)}
                      className="w-full"
                    />

                    {uploadedBill && (
                      <div className="mt-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        Selected: {uploadedBill.name}
                      </div>
                    )}

                    <small className="mt-1 block text-gray-500">
                      PDF, JPG, PNG. Max size: 5MB.
                    </small>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                  After uploading the scanned bill, payment will be completed.
                  To issue certificate, use the Edit button.
                </div>
              </div>
            )}

            {selectedRequest.requestStatus === "PAYMENT_COMPLETED" && (
              <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-700">
                Payment is completed. Use the Edit button to change status to
                issueCertificate.
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
};
