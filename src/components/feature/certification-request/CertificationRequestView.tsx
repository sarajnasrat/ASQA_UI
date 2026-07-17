// components/feature/certification/CertificationRequestView.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  XCircle,
} from "lucide-react";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useTranslation } from "react-i18next";
import CertificationRequestService from "../../../services/CertificationReques.service";
import CommiteeService from "../../../services/comitee.service";
import FileUploadField from "../../common/FileUploadField";
import { SmartDatePicker } from "../../common/datepicker/SmartDatePicker";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import CompanyPdfExport, { type CompanyPdfExportHandle } from "../../common/pdf/CompanyPdfExport";
import CertificationRequestViewHeader from "./certification-process/CertificationRequestViewHeader";
import CertificationRequestViewTabs from "./certification-process/CertificationRequestViewTabs";
import CertificationRequestViewDetails from "./certification-process/CertificationRequestViewDetails";
import CertificationRequestViewCompany from "./certification-process/CertificationRequestViewCompany";
import CertificationRequestViewDocuments from "./certification-process/CertificationRequestViewDocuments";
import type {
  CertificationRequest,
  Tracker,
} from "./certification-process/CertificationRequestView.types";

const API_BASE_URL = "http://localhost:8080";

const transitionMap: Record<string, string[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  STANDARDS_PROVIDED: ["DEADLINE_REQUIRED"],
  DEADLINE_REQUIRED: ["DEADLINE_ASSIGNED"],
  DEADLINE_ASSIGNED: ["INSPECTION_IN_PROGRESS"],
  INSPECTION_IN_PROGRESS: ["REPORTED_TO_COMMITTEE"],
  REPORTED_TO_COMMITTEE: ["REPORT_APPROVED", "REJECTED"],
  COMMITTEE_APPROVED: ["PAYMENT_PENDING"],
  PAYMENT_PENDING: ["PAYMENT_COMPLETED"],
  PAYMENT_COMPLETED: ["CERTIFICATE_ISSUED"],
};

const finalStates = ["UNDER_SUPERVISION", "REJECTED", "CANCELLED"];

interface CommitteeOption {
  label: string;
  value: number;
}

const CommitteeSelectionField: React.FC<{
  options: CommitteeOption[];
  loading: boolean;
  disabled: boolean;
  placeholder: string;
  initialValue?: number | null;
  onSelect: (value: number | null) => void;
}> = ({
  options,
  loading,
  disabled,
  placeholder,
  initialValue = null,
  onSelect,
}) => {
  const [localValue, setLocalValue] = useState<number | null>(initialValue);

  useEffect(() => {
    setLocalValue(initialValue ?? null);
  }, [initialValue]);

  return (
    <Dropdown
      className="w-full mt-3"
      value={localValue}
      options={options}
      optionLabel="label"
      optionValue="value"
      onChange={(e) => {
        const selectedValue =
          e.value === null || e.value === undefined || e.value === ""
            ? null
            : Number(e.value);
        setLocalValue(selectedValue);
        onSelect(selectedValue);
      }}
      loading={loading}
      disabled={disabled}
      showClear
      placeholder={placeholder}
    />
  );
};

const CertificationRequestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast, showToast } = useAppToast();
  const [tracker, setTracker] = useState<Tracker[]>([]);
  const [request, setRequest] = useState<CertificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "company" | "documents"
  >("details");
  const [committees, setCommittees] = useState<any[]>([]);
  const [loadingCommittees, setLoadingCommittees] = useState(false);
  const [calendarType, setCalendarType] = useState<
    "gregorian" | "persian" | "arabic"
  >("gregorian");
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    requestInfo: true,
    quickStats: true,
    contactPersonDetails: true,
  });

  // State for dialog inputs
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | null>(
    null,
  );
  const [selectedStandardFile, setSelectedStandardFile] = useState<File | null>(
    null,
  );
  const [standardRequiredChoice, setStandardRequiredChoice] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [uploadedBill, setUploadedBill] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [requestPrinted, setRequestPrinted] = useState(false);
  const pdfExportRef = useRef<CompanyPdfExportHandle>(null);

  const getFallbackListUrl = (status?: string) => {
    switch (status) {
      case "PAYMENT_PENDING":
      case "PAYMENT_COMPLETED":
        return "/payment-management";
      case "DEADLINE_REQUIRED":
      case "DEADLINE_ASSIGNED":
      case "INSPECTION_IN_PROGRESS":
        return "/certification-request-deadline";
      default:
        return "/certification-request";
    }
  };

  const listUrl =
    typeof location.state?.originPath === "string"
      ? location.state.originPath
      : getFallbackListUrl(request?.requestStatus);

  useEffect(() => {
    if (id) {
      loadRequestDetail();
    }
  }, [id]);

  useEffect(() => {
    const loadCommittees = async () => {
      try {
        setLoadingCommittees(true);
        const response = await CommiteeService.getAllByCommitteeType(
          "INSPECTION",);
        setCommittees(response?.data?.data || response?.data || []);
      } catch {
        showToast(
          "error",
          t("common.error"),
          t("commitee.loadFailed") || "Failed to load committees",
        );
      } finally {
        setLoadingCommittees(false);
      }
    };

    loadCommittees();
  }, []);

  const loadRequestDetail = async () => {
    setLoading(true);
    const showSuccess = () => {};
    const showError = (message: string) => {
      showToast("error", t("common.error"), message);
    };

    const response = await handleApi(
      () => CertificationRequestService.getById(parseInt(id!)),
      showSuccess,
      showError,
      t,
    );

    if (response) {
      setRequest(response.data.data);
      setTracker(response.data.data.trackers || []);
      setRequestPrinted(false);
    }
    setLoading(false);
  };

  const handleDownloadPdf = async () => {
    try {
      await pdfExportRef.current?.downloadPdf();
      showToast("success", t("common.success"), t("common.download"));
    } catch (error) {
      console.error("Error generating certification request PDF:", error);
      showToast(
        "error",
        t("common.error"),
        t("registration.errors.submitFailed"),
      );
    }
  };

  const getNextStatuses = () => {
    if (!request?.requestStatus) return [];
    if (request.requestStatus === "UNDER_REVIEW") {
      return ["DEADLINE_REQUIRED"];
    }
    return transitionMap[request.requestStatus] || [];
  };

  const getStatusButtonLabel = (status: string) => {
    return t(`certificationRequest.statusOptions.${status}`) || status;
  };

  const printBill = async (request: CertificationRequest) => {
    if (request.requestStatus !== "PAYMENT_PENDING") {
      showToast(
        "warn",
        t("common.warning"),
        "Bill can be printed only when payment is pending.",
      );
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const companyName = getCompanyName() || "";
    const invoiceNumber = request.serialNumber || `INV-${Date.now()}`;
    const invoiceDate = IslamicDateFormatter.formatQamari(new Date());
    const dueDate = IslamicDateFormatter.formatQamari(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    const itemDescription = getCertificationTypeLabel(request.certificationType);
    const billAmount =
      (request as any).paymentAmount !== undefined &&
      (request as any).paymentAmount !== null &&
      (request as any).paymentAmount !== ""
        ? String((request as any).paymentAmount)
        : "Contact Support";
    const logoUrl = `${window.location.origin}/asqanew.png`;

    const billContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Bill - ${invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            color: #1f2747;
            padding: 18px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .page-wrap {
            max-width: 820px;
            margin: 0 auto;
          }

          .invoice {
            background: #fff;
            padding: 34px 38px 30px;
            width: 794px;
            min-height: 1123px;
            border: 1px solid #ececec;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            position: relative;
            margin: 0 auto;
          }

          .top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
          }

          .invoice-title {
            font-size: 56px;
            line-height: 0.9;
            font-weight: 800;
            letter-spacing: -0.04em;
            color: #28345f;
            text-transform: uppercase;
          }

          .logo-circle {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            background: #b9bbc3;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .logo-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .company-block {
            margin-top: 10px;
            margin-bottom: 18px;
            font-size: 13px;
            line-height: 1.45;
            color: #1f2747;
          }

          .company-block .name {
            font-weight: 700;
            margin-bottom: 4px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1.2fr;
            gap: 26px;
            margin-bottom: 22px;
          }

          .info-col h3 {
            font-size: 13px;
            line-height: 1.1;
            font-weight: 800;
            text-transform: uppercase;
            color: #28345f;
            margin-bottom: 8px;
          }

          .info-col p {
            font-size: 13px;
            line-height: 1.45;
            color: #111;
          }

          .info-col .person {
            font-weight: 700;
            margin-bottom: 2px;
          }

          .meta-col {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px 14px;
            align-content: start;
          }

          .meta-col .label {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: #28345f;
          }

          .meta-col .value {
            font-size: 13px;
            font-weight: 700;
            color: #111;
            text-align: right;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
          }

          .items-table thead tr {
            border-top: 2px solid #e76657;
            border-bottom: 2px solid #e76657;
          }

          .items-table thead th {
            color: #28345f;
            text-align: left;
            padding: 8px 10px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            background: transparent;
          }

          .items-table tbody td {
            padding: 8px 10px;
            font-size: 13px;
            color: #111;
            vertical-align: top;
          }

          .items-table th:nth-child(1),
          .items-table td:nth-child(1) {
            width: 44px;
            text-align: center;
          }

          .items-table th:nth-child(3),
          .items-table td:nth-child(3),
          .items-table th:nth-child(4),
          .items-table td:nth-child(4),
          .items-table th:nth-child(5),
          .items-table td:nth-child(5) {
            text-align: right;
          }

          .totals {
            width: 240px;
            margin-left: auto;
            margin-bottom: 24px;
          }

          .totals-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 4px 0;
            font-size: 12px;
          }

          .totals-row strong {
            font-size: 13px;
            color: #28345f;
            text-transform: uppercase;
          }

          .grand-total {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-top: 6px;
            color: #28345f;
            font-weight: 800;
          }

          .grand-total .label {
            font-size: 15px;
            text-transform: uppercase;
          }

          .grand-total .value {
            font-size: 34px;
          }

          .signature-wrap {
            text-align: right;
            margin-bottom: 120px;
          }

          .signature {
            font-family: "Brush Script MT", cursive;
            font-size: 58px;
            color: #111;
            line-height: 1;
          }

          .bottom-row {
            position: absolute;
            left: 38px;
            right: 38px;
            bottom: 28px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
          }

          .thank-you {
            font-family: "Brush Script MT", cursive;
            font-size: 62px;
            color: #28345f;
            line-height: 0.95;
            white-space: nowrap;
          }

          .terms {
            width: 260px;
          }

          .terms h4 {
            color: #e76657;
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 12px;
          }

          .terms p {
            font-size: 12px;
            line-height: 1.45;
            color: #111;
            margin-bottom: 10px;
          }

          .action-buttons {
            text-align: center;
            padding-top: 18px;
          }

          .btn {
            padding: 10px 18px;
            font-size: 14px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            margin: 0 6px;
          }

          .btn-print {
            background: #111;
            color: #fff;
          }

            .btn-close {
              background: #e9e9e9;
              color: #111;
            }

          @media print {
            @page {
              size: 210mm 297mm;
              margin: 0;
            }

            html,
            body {
              background: #fff;
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .page-wrap {
              width: 210mm;
              margin: 0;
            }

            .invoice {
              border: none;
              width: 210mm;
              min-height: 297mm;
              padding: 34px 38px 30px;
              box-shadow: none;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .action-buttons {
              display: none;
            }
          }

          @media (max-width: 768px) {
            body {
              padding: 12px;
            }

            .page-wrap,
            .invoice {
              width: 100%;
              min-height: auto;
            }

            .invoice {
              padding: 24px 20px 140px;
            }

            .top-row,
            .info-grid,
            .bottom-row {
              display: block;
            }

            .invoice-title {
              font-size: 46px;
              margin-bottom: 18px;
            }

            .logo-circle {
              margin-left: auto;
              margin-bottom: 14px;
            }

            .info-col,
            .meta-col,
            .terms {
              margin-bottom: 18px;
            }

            .totals {
              width: 100%;
            }

            .signature-wrap {
              margin-bottom: 40px;
            }

            .bottom-row {
              position: static;
            }

            .thank-you {
              font-size: 48px;
              margin-bottom: 18px;
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
        <div class="page-wrap">
          <div class="invoice">
            <div class="top-row">
              <h1 class="invoice-title">Invoice</h1>
              <div class="logo-circle">
                <img src="${logoUrl}" alt="ASQA" />
              </div>
            </div>

            <div class="company-block">
              <div class="name">ASQA</div>
              <div>Kabul, Afghanistan</div>
              <div>Afghanistan Quality Standards Authority</div>
            </div>

            <div class="info-grid">
              <div class="info-col">
                <h3>Bill To</h3>
                <p class="person">${companyName || "-"}</p>
                <p>Certification Request Holder</p>
                <p>${request.trackingNumber || "-"}</p>
              </div>

              <div class="info-col">
                <h3>Ship To</h3>
                <p class="person">${companyName || "-"}</p>
                <p>Certification Service</p>
                <p>${itemDescription}</p>
              </div>

              <div class="meta-col">
                <div class="label">Invoice #</div>
                <div class="value">${invoiceNumber}</div>
                <div class="label">Invoice Date</div>
                <div class="value">${invoiceDate}</div>
                <div class="label">P.O.#</div>
                <div class="value">${request.trackingNumber || "-"}</div>
                <div class="label">Due Date</div>
                <div class="value">${dueDate}</div>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Qty</th>
                  <th>Description</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>${itemDescription}</td>
                  <td>${billAmount}</td>
                  <td>1</td>
                  <td>${billAmount}</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${billAmount}</span>
              </div>
              <div class="totals-row">
                <span>Service Tax 0%</span>
                <span>0.00</span>
              </div>
        
            </div>

       

            <div class="bottom-row">
              <div class="terms">
                <h4>Terms & Conditions</h4>
                <p>Payment is due within 15 days.</p>
                <p>Name of Bank<br>Da Afghanistan Bank</p>
                <p>Account Number: 001-234567-89<br>Routing: 098765432</p>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-print" onclick="window.print()">Print Bill</button>
            <button class="btn btn-close" onclick="window.close()">Close</button>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(billContent);
    printWindow.document.close();
    setRequestPrinted(true);

   const resp = await handleApi(
      () => CertificationRequestService.updateIsPrint(request.id, true),
      () => {},
      (message: string) => showToast("error", t("common.error"), message),
      t,
    );
    if(resp?.status === 200){
     window.location.reload();
    }
  
    
  };

  const openPaymentDialog = () => {
    if (!request) return;
    setUploadedBill(null);
    setTransactionId((request as any).transactionId || "");
    setPaymentDate(
      (request as any).paymentDate
        ? (request as any).paymentDate.split("T")[0]
        : new Date().toISOString().slice(0, 10),
    );
    setPaymentAmount(
      (request as any).paymentAmount
        ? String((request as any).paymentAmount)
        : "",
    );
    setPaymentDialogVisible(true);
  };

  const closePaymentDialog = () => {
    setPaymentDialogVisible(false);
    setUploadedBill(null);
    setTransactionId("");
    setPaymentDate("");
    setPaymentAmount("");
    setUploadingPayment(false);
  };

  const handlePaymentConfirmation = async () => {
    if (!request) return;
    if (!uploadedBill) {
      showToast("warn", t("common.warning"), "Please upload the scanned bill.");
      return;
    }
    if (!transactionId.trim()) {
      showToast("warn", t("common.warning"), "Please enter transaction ID.");
      return;
    }
    setUploadingPayment(true);

    const formData = new FormData();
    formData.append("file", uploadedBill);
    formData.append("transactionId", transactionId);
    formData.append(
      "paymentDate",
      paymentDate ? `${paymentDate}T00:00:00` : new Date().toISOString(),
    );
    formData.append("paymentAmount", paymentAmount || "");

    const handlePaymentError = (message: string) => {
      showToast("error", t("common.error"), message);
    };

    const response = await handleApi(
      () => CertificationRequestService.confirmPayment(request.id, formData),
      () =>
        showToast(
          "success",
          t("common.success"),
          "Scanned bill uploaded successfully.",
        ),
      handlePaymentError,
      t,
    );

    if (response) {
      await handleApi(
        () => CertificationRequestService.updateIsScanned(request.id, true),
        () => {},
        (message: string) => showToast("error", t("common.error"), message),
        t,
      );

      closePaymentDialog();
      loadRequestDetail();
    }
    if(response?.status === 200){
      window.location.reload();
    }

    setUploadingPayment(false);
  };

  const downloadPaymentReceipt = async () => {
    if (!request) return;

    const resp = await handleApi(
      () => CertificationRequestService.getPaymentReceipt(request.id),
      () => {},
      (message: string) => showToast("error", t("common.error"), message),
      t,
    );

    if (resp?.data) {
      const blob = resp.data;
      const url = window.URL.createObjectURL(new Blob([blob]));
      window.open(url, "_blank");
    }
  };

  const getStatusConfirmationMessage = (status: string) => {
    const messages: Record<string, string> = {
      SUBMITTED:
        t("certificationRequest.confirmSubmit") ||
        "Are you sure you want to submit this request?",
      CANCELLED:
        t("certificationRequest.confirmCancel") ||
        "Are you sure you want to cancel this request?",
      UNDER_REVIEW:
        t("certificationRequest.requestWillBeUnderReview") ||
        "This request will be moved to under review.",
      STANDARDS_PROVIDED:
        t("certificationRequest.standardsProvided") ||
        "Please upload the standard document to continue.",
      DEADLINE_REQUIRED:
        t("certificationRequest.deadlineRequired") ||
        "A deadline will be required for this request.",
      DEADLINE_ASSIGNED:
        t("certificationRequest.assignDeadline") ||
        "Please assign the start and end deadline dates.",
      INSPECTION_IN_PROGRESS:
        t("certificationRequest.inspectionInProgress") ||
        "Please assign a committee to start inspection.",
      REPORTED_TO_COMMITTEE:
        t("certificationRequest.reportToCommittee") ||
        "This request will be reported to the committee.",
      REPORT_APPROVED:
        t("certificationRequest.reportApproved") ||
        "The committee report will be approved.",
      PAYMENT_PENDING:
        t("certificationRequest.paymentPending") ||
        "Payment will be marked as pending.",
      PAYMENT_COMPLETED:
        t("certificationRequest.paymentCompleted") ||
        "Payment will be marked as completed.",
      CERTIFICATE_ISSUED:
        t("certificationRequest.certificateIssued") ||
        "Certificate will be issued for this request.",
      UNDER_SUPERVISION:
        t("certificationRequest.underSupervision") ||
        "This request will be moved under supervision.",
      REJECTED:
        t("certificationRequest.confirmReject") ||
        "Please provide a rejection reason.",
    };

    return (
      messages[status] ||
      t("certificationRequest.confirmStatusUpdate") ||
      "Are you sure you want to update this request status?"
    );
  };

  const handleStatusUpdate = async (
    nextStatus: string,
    options?: {
      rejectionReason?: string | null;
      standardRequired?: boolean;
      standardFile?: File | null;
      startDate?: Date | null;
      endDate?: Date | null;
      committeeId?: number | null;
    },
  ) => {
    if (!request?.id) return;

    const cleanReason = options?.rejectionReason?.trim() || "";

    const showSuccess = (summary: string, detail?: string) => {
      showToast(
        "success",
        summary || t("common.success"),
        detail || getStatusButtonLabel(nextStatus),
      );
    };

    const showError = (summary: string, detail?: string) => {
      showToast(
        "error",
        summary || t("common.error"),
        detail || t("common.somethingWentWrong") || "Something went wrong",
      );
    };

    let response;

    const effectiveNextStatus =
      request.requestStatus === "UNDER_REVIEW"
        ? options?.standardRequired
          ? "STANDARDS_PROVIDED"
          : "DEADLINE_REQUIRED"
        : nextStatus;

    if (effectiveNextStatus === "REJECTED") {
      if (!cleanReason) {
        showToast(
          "warn",
          t("common.warning"),
          t("certificationRequest.enterRejectionReason"),
        );
        return;
      }

      response = await handleApi(
        () =>
          CertificationRequestService.rejectCertificationRequest(
            request.id,
            cleanReason,
          ),
        showSuccess,
        showError,
        t,
      );
    } else if (effectiveNextStatus === "STANDARDS_PROVIDED") {
      if (!options?.standardFile) {
        showToast("warn", t("common.warning"), "Please upload standard file");
        return;
      }

      const formData = new FormData();
      formData.append("file", options.standardFile);

      response = await handleApi(
        () =>
          CertificationRequestService.standardProvided(request.id, formData),
        showSuccess,
        showError,
        t,
      );
    } else if (effectiveNextStatus === "DEADLINE_ASSIGNED") {
      if (!options?.startDate || !options?.endDate) {
        showToast("warn", t("common.warning"), t("deadline.required"));
        return;
      }

      if (options.endDate < options.startDate) {
        showToast(
          "warn",
          t("common.warning"),
          "End date must be after start date",
        );
        return;
      }

      response = await handleApi(
        () =>
          CertificationRequestService.setDeadline(
            request.id,
            options.startDate!.toISOString(),
            options.endDate!.toISOString(),
          ),
        showSuccess,
        showError,
        t,
      );
    } else if (effectiveNextStatus === "INSPECTION_IN_PROGRESS") {
      if (!options?.committeeId) {
        showToast("warn", t("common.warning"), t("committee.required"));
        return;
      }

      response = await handleApi(
        () =>
          CertificationRequestService.assignCommittee(
            request.id,
            options.committeeId!,
          ),
        showSuccess,
        showError,
        t,
      );
    } else {
      response = await handleApi(
        () =>
            CertificationRequestService.updateStatus(
              request.id,
              effectiveNextStatus,
              request.company?.id,
            ),
        showSuccess,
        showError,
        t,
      );
    }

    if (response?.status === 200) {
      // Reset dialog states
      setSelectedCommitteeId(null);
      setSelectedStandardFile(null);
      setStandardRequiredChoice(false);
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setRejectionReason("");
      loadRequestDetail();
    }
    return response;
  };

  const getCompanyName = () => {
    const lang = localStorage.getItem("i18nextLng") || "en";
    if (lang === "dr" && request?.company.companyNameDR)
      return request.company.companyNameDR;
    if (lang === "ps" && request?.company.companyNamePS)
      return request.company.companyNamePS;
    return request?.company.companyNameEN;
  };

  const getCertificationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      DOMESTIC_QUALITY_CERTIFICATION: t(
        "certificationRequest.certificationTypeOptions.DOMESTIC_QUALITY_CERTIFICATION",
      ),
      INTERNATIONAL_QUALITY_CERTIFICATION: t(
        "certificationRequest.certificationTypeOptions.INTERNATIONAL_QUALITY_CERTIFICATION",
      ),
      STANDARD_MARK_CERTIFICATION: t(
        "certificationRequest.certificationTypeOptions.STANDARD_MARK_CERTIFICATION",
      ),
      MANAGEMENT_SYSTEM_QUALITY:t("certificationRequest.certificationTypeOptions.MANAGEMENT_SYSTEM_QUALITY"),
      SERVICE_QUALITY:t("certificationRequest.certificationTypeOptions.SERVICE_QUALITY"),
      PRODUCT_QUALITY:"certificationRequest.certificationTypeOptions.PRODUCT_QUALITY"
    };
    return types[type] || type;
  };

  const getCommitteeLabel = (committee: any) => {
    if (!committee) return "";
    return (
      committee.name ||
      committee.committeeName ||
      committee.title ||
      committee.committeeNameEN ||
      committee.committeeNameDR ||
      committee.committeeNamePS ||
      `#${committee.id ?? ""}`
    );
  };

  const committeeOptions: CommitteeOption[] = committees
    .map((committee) => ({
      label: getCommitteeLabel(committee),
      value:
        committee?.id !== null && committee?.id !== undefined
          ? Number(committee.id)
          : null,
    }))
    .filter(
      (option): option is CommitteeOption =>
        option.value !== null && Boolean(option.label),
    );

  const closeStatusDialog = () => {
    if (statusSubmitting) return;
    setStatusDialogVisible(false);
    setPendingStatus(null);
    setSelectedCommitteeId(null);
    setSelectedStandardFile(null);
    setStandardRequiredChoice(false);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setRejectionReason("");
    setCalendarType("gregorian");
  };

  const confirmStatusUpdate = (nextStatus: string) => {
    setSelectedCommitteeId(null);
    setSelectedStandardFile(null);
    setStandardRequiredChoice(Boolean(request?.standardRequired));
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setRejectionReason("");
    setCalendarType("gregorian");
    setPendingStatus(nextStatus);
    setStatusDialogVisible(true);
  };

  const submitStatusDialog = async () => {
    if (!pendingStatus || statusSubmitting) return;

    const isReject = pendingStatus === "REJECTED";
    const isUnderReviewDecision =
      request?.requestStatus === "UNDER_REVIEW" &&
      pendingStatus === "DEADLINE_REQUIRED";
    const isStandardProvided =
      pendingStatus === "STANDARDS_PROVIDED" ||
      (isUnderReviewDecision && standardRequiredChoice);
    const isDeadlineAssigned = pendingStatus === "DEADLINE_ASSIGNED";
    const isInspectionInProgress = pendingStatus === "INSPECTION_IN_PROGRESS";

    if (isReject && !rejectionReason.trim()) {
      showToast(
        "warn",
        t("common.warning"),
        t("certificationRequest.enterRejectionReason") ||
          "Please provide a rejection reason",
      );
      return;
    }

    if (isStandardProvided && !selectedStandardFile) {
      showToast(
        "warn",
        t("common.warning"),
        t("attachment.STANDARD") || "Please upload standard file",
      );
      return;
    }

    if (isDeadlineAssigned && (!selectedStartDate || !selectedEndDate)) {
      showToast("warn", t("common.warning"), t("deadline.required"));
      return;
    }

    if (
      isDeadlineAssigned &&
      selectedStartDate &&
      selectedEndDate &&
      selectedEndDate < selectedStartDate
    ) {
      showToast(
        "warn",
        t("common.warning"),
        "End date must be after start date",
      );
      return;
    }

    if (isInspectionInProgress && !selectedCommitteeId) {
      showToast("warn", t("common.warning"), t("committee.required"));
      return;
    }

    try {
      setStatusSubmitting(true);
      const response = await handleStatusUpdate(pendingStatus, {
        rejectionReason: isReject ? rejectionReason : null,
        standardRequired: isUnderReviewDecision ? standardRequiredChoice : undefined,
        standardFile: isStandardProvided ? selectedStandardFile : null,
        startDate: isDeadlineAssigned ? selectedStartDate : null,
        endDate: isDeadlineAssigned ? selectedEndDate : null,
        committeeId: isInspectionInProgress ? selectedCommitteeId : null,
      });

      if (response?.status === 200) {
        closeStatusDialog();
        navigateAfterStatusUpdate(
          isUnderReviewDecision && standardRequiredChoice
            ? "STANDARDS_PROVIDED"
            : pendingStatus,
        );
      }
    } catch (error) {
      console.error("Status update failed:", error);
      showToast(
        "error",
        t("common.error"),
        t("certificationRequest.updateFailed") ||
          "Failed to update status. Please try again.",
      );
    } finally {
      setStatusSubmitting(false);
    }
  };

  const navigateAfterStatusUpdate = (nextStatus: string) => {
    switch (nextStatus) {
      case "UNDER_REVIEW":
        navigate(`/certification-request`);
        break;
      case "REJECTED":
        navigate("/certification-request");
        break;
      case "PAYMENT_PENDING":
        navigate("/payment-management");
        break;
      case "PAYMENT_COMPLETED":
        navigate("/payment-management");
        break;
      case "STANDARDS_PROVIDED":
        // Refresh current page to show updated data
        navigate("/standard-management");
        break;
      case "DEADLINE_REQUIRED":
        navigate("/certification-request-deadline");
        break;

      case "DEADLINE_ASSIGNED":
        // Navigate to the request detail page
        navigate(`/certification-request-deadline`);
        break;
      case "INSPECTION_IN_PROGRESS":
        navigate("/certification-request-deadline");
        break;
      case "REPORT_APPROVED":
        navigate("/certification-request");
        break;
      case "CERTIFICATE_ISSUED":
        navigate("/certification-request");
        break;
      default:
        // Default: go back to list
        navigate("/certification-request");
        break;
    }
  };

  const getStatusConfig = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; bgColor: string; icon: React.ReactNode; label: string }
    > = {
      DRAFT: {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.DRAFT"),
      },
      SUBMITTED: {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: <Clock className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.SUBMITTED"),
      },
      UNDER_REVIEW: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.UNDER_REVIEW"),
      },
      REJECTED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REJECTED"),
      },
      CERTIFICATE_ISSUED: {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        icon: <Award className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.CERTIFICATE_ISSUED"),
      },
      STANDARDS_PROVIDED: {
        color: "text-cyan-700",
        bgColor: "bg-cyan-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.STANDARDS_PROVIDED"),
      },
      DEADLINE_ASSIGNED: {
        color: "text-orange-700",
        bgColor: "bg-orange-100",
        icon: <Calendar className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.DEADLINE_ASSIGNED"),
      },
      INSPECTION_IN_PROGRESS: {
        color: "text-indigo-700",
        bgColor: "bg-indigo-100",
        icon: <Clock className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.INSPECTION_IN_PROGRESS"),
      },
      REPORTED_TO_COMMITTEE: {
        color: "text-pink-700",
        bgColor: "bg-pink-100",
        icon: <FileText className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REPORTED_TO_COMMITTEE"),
      },
      REPORT_APPROVED: {
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
        icon: <CheckCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
      },
      PAYMENT_PENDING: {
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.PAYMENT_PENDING"),
      },
      PAYMENT_COMPLETED: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"),
      },
      UNDER_SUPERVISION: {
        color: "text-slate-700",
        bgColor: "bg-slate-100",
        icon: <Shield className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.UNDER_SUPERVISION"),
      },
      CANCELLED: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.CANCELLED"),
      },
      DEADLINE_REQUIRED: {
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        icon: <Calendar className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.DEADLINE_REQUIRED"),
      },
    };

    return (
      statusMap[status] || {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: <FileText className="h-4 w-4" />,
        label: status,
      }
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      NEW: t("certificationRequest.typeOptions.NEW"),
      RENEWAL: t("certificationRequest.typeOptions.RENEWAL"),
      EXTENSION: t("certificationRequest.typeOptions.EXTENSION"),
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t("common.notSpecified");
    return IslamicDateFormatter.formatQamari(dateString);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getAboutCompany = () => {
    const lang = localStorage.getItem("i18nextLng") || "en";
    if (lang === "dr" && request?.company.aboutCompanyDr)
      return request.company.aboutCompanyDr;
    if (lang === "ps" && request?.company.aboutCompanyPs)
      return request.company.aboutCompanyPs;
    return request?.company.aboutCompanyEn;
  };

  const getContactPerson = () => {
    return request?.contactPerson || request?.company?.contactPerson;
  };

  const getAddressTypeLabel = (addressType: string) => {
    const types: Record<string, string> = {
      HEAD_OFFICE: t("contactPerson.addresses.addressTypes.HEAD_OFFICE"),
      BRANCH_OFFICE: t("contactPerson.addresses.addressTypes.BRANCH_OFFICE"),
      HOME: t("contactPerson.addresses.addressTypes.HOME"),
      OTHER: t("contactPerson.addresses.addressTypes.OTHER"),
    };
    return types[addressType] || addressType;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("common.notFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("certificationRequest.loadFailed")}
          </p>
          <button
            onClick={() => navigate("/certification-request-requests")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.requestStatus);
  const hasAttachments =
    (request.attachments?.length || 0) +
      (request.company?.attachments?.length || 0) >
    0;
  const contactPerson = getContactPerson();
  const isRejectDialog = pendingStatus === "REJECTED";
  const isUnderReviewDecisionDialog =
    request?.requestStatus === "UNDER_REVIEW" &&
    pendingStatus === "DEADLINE_REQUIRED";
  const isStandardProvidedDialog =
    pendingStatus === "STANDARDS_PROVIDED" ||
    (isUnderReviewDecisionDialog && standardRequiredChoice);
  const isDeadlineAssignedDialog = pendingStatus === "DEADLINE_ASSIGNED";
  const isInspectionInProgressDialog =
    pendingStatus === "INSPECTION_IN_PROGRESS";
  const dialogRequestType = getCertificationTypeLabel(
    request?.certificationType || "",
  );
  const dialogRequestId =
    request?.serialNumber || request?.trackingNumber || "";
  const dialogCompanyName = getCompanyName() || "";

  return (
    <div className="min-h-screen bg-gray-50  pb-10">
      <Toast ref={toast} position="top-right" />
      <div className="container mx-auto px-4 max-w-7xl">
        <Dialog
          header={
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 bg-white rounded-t-xl">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isRejectDialog ? "bg-red-100" : "bg-green-100"
                }`}
              >
                {isRejectDialog ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {pendingStatus ? getStatusButtonLabel(pendingStatus) : ""}
              </span>
            </div>
          }
          visible={statusDialogVisible}
          onHide={closeStatusDialog}
          draggable={false}
          resizable={false}
          dismissableMask
          closeOnEscape
          style={{ width: "700px", maxWidth: "95vw" }}
          breakpoints={{ "960px": "95vw", "640px": "95vw" }}
          className="rounded-2xl shadow-2xl border border-gray-200"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeStatusDialog}
                disabled={statusSubmitting}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={submitStatusDialog}
                disabled={statusSubmitting}
                className={
                  isRejectDialog
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    : "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                }
              >
                {pendingStatus
                  ? statusSubmitting
                    ? t("common.updating")
                    : isRejectDialog
                      ? `X ${getStatusButtonLabel("REJECTED")}`
                      : isUnderReviewDecisionDialog && standardRequiredChoice
                        ? `${getStatusButtonLabel("STANDARDS_PROVIDED")}`
                      : `${getStatusButtonLabel(pendingStatus)}`
                  : ""}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">
                  {t("certificationRequest.labels.requestType")}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {dialogRequestType}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">
                  {t("certificationRequest.labels.serialNumber")}
                </span>
                <span className="text-sm font-mono font-medium text-gray-800">
                  {dialogRequestId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">
                  {t("company.labels.companyName")}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {dialogCompanyName}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg text-sm bg-amber-50 border border-amber-100">
              {isRejectDialog && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("certificationRequest.rejectReason") ||
                      "Rejection Reason"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    autoFocus
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={
                      t("certificationRequest.enterRejectionReason") ||
                      "Please provide a reason for rejection..."
                    }
                    className="w-full min-h-25 rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 resize-y"
                    rows={4}
                  />
                </div>
              )}

              {isUnderReviewDecisionDialog && (
                <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={standardRequiredChoice}
                      onChange={(e) => {
                        setStandardRequiredChoice(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedStandardFile(null);
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {t("certificationRequest.standardsRequired") ||
                          "Standard is required for this request"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {standardRequiredChoice
                          ? t("certificationRequest.standardsProvided") ||
                            "Upload the standard file before continuing."
                          : t("certificationRequest.deadlineRequired") ||
                            "Continue without standard and move to the next step."}
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {isStandardProvidedDialog && (
                <FileUploadField
                  key={`status-standard-${statusDialogVisible ? "open" : "closed"}-${pendingStatus ?? "none"}`}
                  label={t("attachment.STANDARD")}
                  accept=".pdf,.jpg,.png"
                  maxFileSize={5000000}
                  required
                  onFileSelect={(file) => {
                    setSelectedStandardFile(file);
                  }}
                />
              )}

              {isDeadlineAssignedDialog && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("common.selectDateType")} *
                    </label>
                    <Dropdown
                      className="w-full mb-3"
                      value={calendarType}
                      options={[
                        { label: t("common.gregorian"), value: "gregorian" },
                        { label: t("common.arabic"), value: "arabic" },
                        { label: t("common.persian"), value: "persian" },
                      ]}
                      onChange={(e) => setCalendarType(e.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <SmartDatePicker
                      widthValue={280}
                      key={`status-start-${pendingStatus ?? "none"}-${calendarType}`}
                      label={t("common.startDate")}
                      value={selectedStartDate ?? undefined}
                      calendarType={calendarType}
                      onChange={(d: any) => {
                        setSelectedStartDate(d ? new Date(d?.date || d) : null);
                      }}
                    />
                    <SmartDatePicker
                      widthValue={280}
                      key={`status-end-${pendingStatus ?? "none"}-${calendarType}`}
                      label={t("common.endDate")}
                      value={selectedEndDate ?? undefined}
                      calendarType={calendarType}
                      onChange={(d: any) => {
                        setSelectedEndDate(d ? new Date(d?.date || d) : null);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"></div>
                </>
              )}

              {isInspectionInProgressDialog && (
                <CommitteeSelectionField
                  key={`status-committee-${statusDialogVisible ? "open" : "closed"}-${pendingStatus ?? "none"}`}
                  options={committeeOptions}
                  loading={loadingCommittees}
                  disabled={loadingCommittees || committeeOptions.length === 0}
                  placeholder={t("commitee.selectCommittee")}
                  initialValue={selectedCommitteeId}
                  onSelect={(selectedValue) => {
                    setSelectedCommitteeId(selectedValue);
                  }}
                />
              )}

              {!isRejectDialog &&
                !isStandardProvidedDialog &&
                !isDeadlineAssignedDialog &&
                !isInspectionInProgressDialog &&
                pendingStatus && (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <strong>{getStatusButtonLabel(pendingStatus)}</strong>
                    </div>
                    <span>{getStatusConfirmationMessage(pendingStatus)}</span>
                  </div>
                )}
            </div>
          </div>
        </Dialog>

        <Dialog
          header={
            request?.requestStatus === "PAYMENT_PENDING" && !request?.isScanned
              ? t("certificationRequest.uploadScannedBill") ||
                "Upload Scanned Bill"
              : t("certificationRequest.paymentDetails") || "Payment Details"
          }
          visible={paymentDialogVisible}
          onHide={closePaymentDialog}
          style={{ width: "750px", borderRadius: "15px" }}
          draggable={true}
          resizable={true}
        >
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                {t("certificationRequest.requestInformation") ||
                  "Request Information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-gray-500">
                    {t("certificationRequest.labels.serialNumber")}
                  </span>
                  <span className="font-medium text-gray-900">
                    {request.serialNumber || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">
                    {t("certificationRequest.labels.trackingNumber")}
                  </span>
                  <span className="font-medium text-gray-900">
                    {request.trackingNumber || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">
                    {t("company.labels.companyName")}
                  </span>
                  <span className="font-medium text-gray-900">
                    {getCompanyName() || "-"}
                  </span>
                </div>
              </div>
            </div>

            {request.requestStatus === "PAYMENT_PENDING" &&
              !request.isScanned && (
                <div className="rounded-lg border border-blue-100 bg-white p-2">
                  <h3 className="mb-3 text-base font-semibold text-gray-800">
                    {t("certificationRequest.scanUploadInformation") ||
                      "Scan Upload Information"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("certificationRequest.transactionId") ||
                          "Transaction ID"}{" "}
                        *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder={
                          t("certificationRequest.transactionId") ||
                          "Transaction ID"
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("certificationRequest.paymentDate") || "Payment Date"}
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div> */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("certificationRequest.paymentAmount") ||
                          "Payment Amount"}
                      </label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={
                          t("certificationRequest.paymentAmount") ||
                          "Payment Amount"
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="pt-3">
                    <FileUploadField
                      key={`payment-upload-${paymentDialogVisible ? "open" : "closed"}-${request.id}`}
                      label={
                        t("certificationRequest.scannedBill") || "Scanned Bill"
                      }
                      accept=".pdf,.jpg,.png"
                      maxFileSize={10000000}
                      required
                      onFileSelect={(file) => setUploadedBill(file)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closePaymentDialog}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="button"
                      disabled={uploadingPayment}
                      onClick={handlePaymentConfirmation}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingPayment
                        ? t("common.uploading") || "Uploading..."
                        : t("certificationRequest.uploadScannedBill") ||
                          "Upload Scanned Bill"}
                    </button>
                  </div>
                </div>
              )}

            {(request.requestStatus === "PAYMENT_COMPLETED" ||
              request.isScanned) && (
              <div className="rounded-lg border border-green-100 bg-white p-4 text-sm text-gray-900">
                <h3 className="mb-3 text-base font-semibold text-gray-800">
                  {t("certificationRequest.paymentDetails") ||
                    "Payment Details"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500">
                      {t("certificationRequest.transactionId") ||
                        "Transaction ID"}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(request as any).payments.transactionId || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">
                      {t("certificationRequest.paymentDate") || "Payment Date"}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(request as any).paymentDate
                        ? IslamicDateFormatter.formatQamari(
                            (request as any).paymentDate,
                          )
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">
                      {t("certificationRequest.paymentAmount") ||
                        "Payment Amount"}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(request as any).paymentAmount || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">
                      {t("certificationRequest.scannedBill") || "Scanned Bill"}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <button
                        type="button"
                        onClick={downloadPaymentReceipt}
                        className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                      >
                        {t("common.view") || "View"}
                      </button>
                      <a
                        href={
                          (request as any).paymentReceiptUrl ||
                          (request as any).receiptFilePath ||
                          "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 rounded-md text-sm ${
                          (request as any).paymentReceiptUrl ||
                          (request as any).receiptFilePath
                            ? "bg-gray-100 text-gray-800"
                            : "text-gray-400"
                        }`}
                      >
                        {t("common.download") || "Download"}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  {t("certificationRequest.paymentCompletedNote") ||
                    "Payment is completed. Use the Edit button to change status to issueCertificate."}
                </div>
              </div>
            )}
          </div>
        </Dialog>

        <CertificationRequestViewHeader
          request={request}
          listUrl={listUrl}
          statusConfig={statusConfig}
          finalStates={finalStates}
          getNextStatuses={getNextStatuses}
          getStatusButtonLabel={getStatusButtonLabel}
          getCertificationTypeLabel={getCertificationTypeLabel}
          onBack={() => navigate(-1)}
          onStatusAction={confirmStatusUpdate}
          onDownloadPdf={handleDownloadPdf}
          onPrintBill={() => printBill(request)}
          onOpenPaymentDialog={openPaymentDialog}
          canUploadScannedBillButton={
            request.requestStatus === "PAYMENT_PENDING" &&
            !request.isScanned &&
            ((request as any).isPrint ||
              (request as any).isPrinted ||
              requestPrinted)
          }
          showPaymentDetailsAction={Boolean(
            request.isScanned || request.requestStatus === "PAYMENT_COMPLETED",
          )}
          t={t}
        />

        <CertificationRequestViewTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasAttachments={
            (request.attachments?.length || 0) +
            (request.company?.attachments?.length || 0)
          }
          t={t}
        />

        {activeTab === "details" && (
          <CertificationRequestViewDetails
            request={request}
            tracker={tracker}
            expandedSections={{
              timeline: expandedSections.timeline,
              requestInfo: expandedSections.requestInfo,
              quickStats: expandedSections.quickStats,
            }}
            toggleSection={toggleSection}
            getStatusConfig={getStatusConfig}
            formatDate={formatDate}
            getRequestTypeLabel={getRequestTypeLabel}
            getCertificationTypeLabel={getCertificationTypeLabel}
            hasAttachments={hasAttachments}
            t={t}
          />
        )}

        {activeTab === "company" && request.company && (
          <CertificationRequestViewCompany
            request={request}
            getCompanyName={getCompanyName}
            getAboutCompany={getAboutCompany}
            getAddressTypeLabel={getAddressTypeLabel}
            formatDate={formatDate}
            toggleSection={toggleSection}
            expandedSections={{
              contactPersonDetails: expandedSections.contactPersonDetails,
            }}
            contactPerson={contactPerson}
            apiBaseUrl={API_BASE_URL}
            t={t}
          />
        )}

        {activeTab === "documents" && (
          <CertificationRequestViewDocuments
            request={request}
            formatFileSize={formatFileSize}
            apiBaseUrl={API_BASE_URL}
            t={t}
          />
        )}
        <CompanyPdfExport
          ref={pdfExportRef}
          company={request?.company}
          contactPersons={contactPerson ? [contactPerson] : []}
          certificationRequests={request?.id ? [request] : []}
          certifications={[]}
          assetUrl={(path?: string) => {
            if (!path) return "";
            if (path.startsWith("http")) return path;
            const baseUrl =
              import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
              "http://localhost:8080";
            return `${baseUrl}${path}`;
          }}
          filename={`certification-request-${request?.id || "export"}.pdf`}
          authorityLogoSrc={`${window.location.origin}/asqanew.png`}
          fallbackLogoSrc={`${window.location.origin}/MOLSA-LOGO.png`}
        />
      </div>
    </div>
  );
};

export default CertificationRequestView;
