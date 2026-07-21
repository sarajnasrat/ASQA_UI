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
    } else if (requestStatus === "CERTIFICATION_ISSUED") {
      return t("certificationRequest.startSupervision");
    } else {
      return t("common.edit");
    }
  };

  const printBill = async (request: any) => {
    if (request.requestStatus !== "PAYMENT_PENDING") {
      toast.current?.show({
        severity: "warn",
        summary: t("common.warning"),
        detail: t("certificationRequest.payment.printPendingOnly"),
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoiceNumber = request.serialNumber || `INV-${Date.now()}`;
    const companyName = request.company?.[getCompanyNameField()] || "-";
    const invoiceDate = IslamicDateFormatter.formatQamari(new Date());
    const dueDate = IslamicDateFormatter.formatQamari(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    const itemDescription =
      t(`certificationRequest.certificationTypeOptions.${request.certificationType}`) ||
      "Certification Fee";
    const amountDisplay =
      request.paymentAmount !== undefined &&
      request.paymentAmount !== null &&
      request.paymentAmount !== ""
        ? String(request.paymentAmount)
        : "Contact Support";

    const billContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f0f0f0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .invoice {
      max-width: 800px;
      width: 100%;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* Header */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .invoice-title h1 {
      font-size: 32px;
      font-weight: 300;
      color: #333;
      margin-bottom: 8px;
    }

    .invoice-title p {
      font-size: 14px;
      color: #666;
    }

    .company-name {
      text-align: right;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    /* Info Row */
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 40px;
    }

    .info-section {
      flex: 1;
    }

    .info-section h3 {
      font-size: 12px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .info-section p {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }

    /* Bank Details */
    .bank-details {
      margin-bottom: 30px;
    }

    .bank-details h3 {
      font-size: 12px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .bank-details p {
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }

    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .items-table th {
      text-align: left;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
      font-size: 12px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-table td {
      padding: 10px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #333;
    }

    .items-table td:first-child,
    .items-table th:first-child {
      width: 50px;
    }

    .items-table td:nth-child(3),
    .items-table th:nth-child(3),
    .items-table td:nth-child(4),
    .items-table th:nth-child(4),
    .items-table td:nth-child(5),
    .items-table th:nth-child(5) {
      text-align: right;
    }

    /* Total Amount */
    .total-amount {
      text-align: right;
      margin-bottom: 30px;
    }

    .total-amount h3 {
      font-size: 12px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .total-amount p {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
    }

    .footer-company {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .footer-contact {
      font-size: 13px;
      color: #666;
      line-height: 1.8;
    }

    .footer-contact p {
      margin: 0;
    }

    /* Action Buttons */
    .action-buttons {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 6px;
    }

    .btn-print {
      background: #333;
      color: white;
    }

    .btn-print:hover {
      background: #555;
    }

    .btn-close {
      background: #e0e0e0;
      color: #333;
    }

    .btn-close:hover {
      background: #ccc;
    }

    /* Print Styles */
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .invoice {
        padding: 20px;
        box-shadow: none;
      }
      .action-buttons {
        display: none;
      }
    }

    @media (max-width: 600px) {
      .invoice {
        padding: 25px;
      }
      .invoice-header {
        flex-direction: column;
        text-align: center;
      }
      .company-name {
        text-align: center;
      }
      .info-row {
        flex-direction: column;
        gap: 20px;
      }
      .total-amount {
        text-align: center;
      }
    }

    :root {
      --invoice-accent: #f68b1f;
      --invoice-text: #1f2937;
      --invoice-muted: #6b7280;
      --invoice-border: #e5e7eb;
      --invoice-row: #f8fafc;
      --invoice-bg: #fffaf5;
    }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background:
        radial-gradient(circle at top right, rgba(246, 139, 31, 0.16), transparent 180px),
        radial-gradient(circle at 85% 6%, rgba(246, 139, 31, 0.10), transparent 130px),
        linear-gradient(180deg, #fffdf9 0%, #fff7ef 100%);
      color: var(--invoice-text);
      padding: 32px 16px;
    }

    .invoice {
      max-width: 960px;
      margin: 0 auto;
      border: 1px solid rgba(246, 139, 31, 0.18);
      border-radius: 24px;
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.10);
      position: relative;
      overflow: hidden;
    }

    .invoice::before,
    .invoice::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      pointer-events: none;
      z-index: 0;
    }

    .invoice::before {
      width: 220px;
      height: 220px;
      top: -120px;
      right: -90px;
      background: radial-gradient(circle, rgba(246, 139, 31, 0.20) 0%, rgba(246, 139, 31, 0) 72%);
    }

    .invoice::after {
      width: 180px;
      height: 180px;
      top: -75px;
      right: 35px;
      border: 1px dashed rgba(31, 41, 55, 0.20);
    }

    .invoice > * {
      position: relative;
      z-index: 1;
    }

    .invoice-header {
      margin-bottom: 28px;
      gap: 24px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
    }

    .brand-mark {
      width: 18px;
      height: 18px;
      border-radius: 6px 6px 6px 0;
      background: linear-gradient(135deg, #f68b1f, #ffb463);
      transform: rotate(45deg);
      box-shadow: 0 8px 16px rgba(246, 139, 31, 0.30);
    }

    .brand-text {
      font-size: 1rem;
      font-weight: 700;
      color: #111827;
    }

    .invoice-title h1 {
      font-size: clamp(2.8rem, 7vw, 4.6rem);
      line-height: 0.95;
      letter-spacing: -0.06em;
      color: var(--invoice-accent);
      margin-bottom: 14px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .invoice-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.95rem;
      color: var(--invoice-text);
    }

    .invoice-meta span + span {
      padding-left: 12px;
      border-left: 1px solid var(--invoice-border);
    }

    .company-name {
      text-align: right;
      max-width: 280px;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
    }

    .company-name strong {
      display: block;
      font-size: 1.3rem;
      margin-bottom: 6px;
      color: #111827;
    }

    .company-name p {
      color: var(--invoice-muted);
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .invoice-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr);
      gap: 26px;
      margin-bottom: 30px;
    }

    .bill-card,
    .bank-details {
      background: var(--invoice-bg);
      border: 1px solid rgba(246, 139, 31, 0.15);
      border-radius: 20px;
      padding: 22px 24px;
    }

    .section-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--invoice-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 10px;
    }

    .billed-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 14px;
    }

    .bill-dates {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .bill-dates strong,
    .bank-details h3 {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--invoice-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: block;
      margin-bottom: 6px;
    }

    .bill-dates span,
    .bank-details p {
      font-size: 1rem;
      color: var(--invoice-text);
      line-height: 1.7;
      margin-bottom: 0;
    }

    .summary-box {
      align-self: start;
      background: linear-gradient(135deg, #f68b1f 0%, #ff9f43 100%);
      color: white;
      border-radius: 22px;
      padding: 24px;
      box-shadow: 0 18px 32px rgba(246, 139, 31, 0.28);
    }

    .summary-box h3 {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
      opacity: 0.92;
    }

    .summary-box p {
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 800;
      line-height: 1.1;
      word-break: break-word;
    }

    .summary-box small {
      display: block;
      margin-top: 12px;
      font-size: 0.88rem;
      opacity: 0.95;
    }

    .items-table {
      border-collapse: separate;
      border-spacing: 0 10px;
    }

    .items-table th {
      padding: 16px 18px;
      background: var(--invoice-accent);
      color: white;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      border-bottom: none;
    }

    .items-table th:first-child {
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
    }

    .items-table th:last-child {
      border-top-right-radius: 14px;
      border-bottom-right-radius: 14px;
    }

    .items-table tbody tr {
      background: white;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    }

    .items-table tbody tr:nth-child(even) {
      background: var(--invoice-row);
    }

    .items-table td {
      padding: 16px 18px;
      font-size: 0.97rem;
      color: var(--invoice-text);
      border-top: 1px solid #eef2f7;
      border-bottom: 1px solid #eef2f7;
    }

    .items-table td:first-child {
      border-left: 1px solid #eef2f7;
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
      width: 60px;
      font-weight: 700;
      text-align: center;
    }

    .items-table td:last-child {
      border-right: 1px solid #eef2f7;
      border-top-right-radius: 14px;
      border-bottom-right-radius: 14px;
      font-weight: 700;
    }

    .notes-footer {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
      gap: 24px;
      margin-top: 10px;
      align-items: stretch;
    }

    .contact-panel {
      background: linear-gradient(135deg, #f68b1f 0%, #ff9f43 100%);
      color: white;
      border-radius: 20px;
      padding: 22px 24px;
    }

    .contact-panel p {
      line-height: 1.8;
      font-size: 0.96rem;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 20px;
      margin-top: 14px;
      font-size: 0.92rem;
    }

    .thank-you {
      background: #111827;
      color: white;
      border-radius: 20px;
      padding: 22px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 0.98rem;
      line-height: 1.7;
    }

    .action-buttons {
      padding-top: 24px;
      border-top: 1px solid var(--invoice-border);
    }

    .btn {
      padding: 12px 24px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 999px;
    }

    .btn-print {
      background: #111827;
      color: white;
    }

    .btn-print:hover {
      background: #1f2937;
    }

    .btn-close {
      background: #f3f4f6;
      color: #111827;
    }

    .btn-close:hover {
      background: #e5e7eb;
    }

    @media print {
      @page {
        size: A4;
        margin: 10mm;
      }

      body {
        background: white;
        padding: 0;
      }

      .invoice {
        box-shadow: none;
        border: none;
        border-radius: 0;
        max-width: none;
        padding: 18px;
      }

      .action-buttons {
        display: none;
      }
    }

    @media (max-width: 820px) {
      .invoice {
        padding: 28px 20px;
      }

      .invoice-header {
        flex-direction: column;
      }

      .company-name {
        text-align: left;
        max-width: none;
      }

      .invoice-grid,
      .notes-footer,
      .bill-dates,
      .contact-grid {
        grid-template-columns: 1fr;
      }

      .items-table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
      }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="invoice-header">
      <div class="invoice-title">
        <div class="brand">
          <div class="brand-mark"></div>
          <div class="brand-text">ASQA Studio</div>
        </div>
        <h1>Invoice</h1>
        <div class="invoice-meta">
          <span>Invoice no : ${invoiceNumber}</span>
          <span>${invoiceDate}</span>
        </div>
      </div>
      <div class="company-name">
        <strong>Bill Issuer</strong>
        <p>ASQA<br>Afghanistan Quality Standards Authority</p>
      </div>
    </div>

    <div class="invoice-grid">
      <div>
        <div class="bill-card">
          <div class="section-label">Billed To</div>
          <div class="billed-name">${companyName}</div>
          <div class="bill-dates">
            <div>
              <strong>Invoice Date</strong>
              <span>${invoiceDate}</span>
            </div>
            <div>
              <strong>Due Date</strong>
              <span>${dueDate}</span>
            </div>
          </div>
        </div>

        <div class="bank-details" style="margin-top: 18px;">
          <h3>Please make payment via</h3>
          <p>Bank Name : Da Afghanistan Bank</p>
          <p>Account Number : 001-234567-89</p>
          <p>Account Holder : ASQA Certification Authority</p>
          <p>Reference : ${invoiceNumber}</p>
        </div>
      </div>

      <div class="summary-box">
        <h3>Total Amount Due</h3>
        <p>${amountDisplay}</p>
        <small>Kindly complete the payment before the due date and keep this invoice for your records.</small>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Item Description</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>${itemDescription}</td>
          <td>${amountDisplay}</td>
          <td>1</td>
          <td>${amountDisplay}</td>
        </tr>
     
      </tbody>
    </table>

    <div class="notes-footer">
      <div class="contact-panel">
        <p>If you have any questions about this invoice, feel free to contact us at:</p>
        <div class="contact-grid">
          <div>+93 (555) 123-4567</div>
          <div>support@asqa.af</div>
          <div>www.asqa.af</div>
          <div>Kabul, Afghanistan</div>
        </div>
      </div>
      <div class="thank-you">
        Thank you for trusting ASQA. We are proud to support your certification journey.
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print Invoice</button>
      <button class="btn btn-close" onclick="window.close()">✖ Close</button>
    </div>
  </div>
</body>
</html>
`;
    printWindow.document.write(billContent);
    printWindow.document.close();
    // mark printed locally so upload option appears
    try {
      setPrintedRequests((prev) => (prev.includes(request.id) ? prev : [...prev, request.id]));
    } catch (e) {
      // ignore
    }

    try {
      await CertificationRequestService.updateIsPrint(request.id, true);
    } catch (error) {
      // ignore failure for now; local state still allows upload
    }
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
      // {
      //   label: editButtonLabel(rowData.requestStatus),
      //   icon: "pi pi-pencil",
      //   command: () => {
      //     setSelectedId(rowData.id);
      //     setUpdateVisible(true);
      //   },
      // },
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
