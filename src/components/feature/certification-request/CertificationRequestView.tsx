// components/feature/certification/CertificationRequestView.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
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
  UNDER_REVIEW: ["STANDARDS_REQUIRED"],
  STANDARDS_REQUIRED: ["STANDARDS_PROVIDED"],
  STANDARDS_PROVIDED: ["DEADLINE_REQUIRED"],
  DEADLINE_REQUIRED: ["DEADLINE_ASSIGNED"],
  DEADLINE_ASSIGNED: ["INSPECTION_IN_PROGRESS"],
  INSPECTION_IN_PROGRESS: ["REPORTED_TO_COMMITTEE"],
  REPORTED_TO_COMMITTEE: ["REPORT_APPROVED", "REJECTED"],
  REPORT_APPROVED: ["PAYMENT_PENDING"],
  PAYMENT_PENDING: ["PAYMENT_COMPLETED"],
  PAYMENT_COMPLETED: ["CERTIFICATE_ISSUED"],
};

const finalStates = ["UNDER_SUPERVISION", "REJECTED", "CANCELLED"];

const CertificationRequestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useAppToast();
  const [tracker, setTracker] = useState<Tracker[]>([]);
  const [request, setRequest] = useState<CertificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "company" | "documents"
  >("details");
  const [committees, setCommittees] = useState<any[]>([]);
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
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [uploadedBill, setUploadedBill] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [requestPrinted, setRequestPrinted] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequestDetail();
    }
  }, [id]);

  useEffect(() => {
    const loadCommittees = async () => {
      try {
        const response = await CommiteeService.getAll();
        setCommittees(response?.data?.data || response?.data || []);
      } catch {
        showToast(
          "error",
          t("common.error"),
          t("committee.loadFailed") || "Failed to load committees",
        );
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

  const getNextStatuses = () => {
    if (!request?.requestStatus) return [];
    return transitionMap[request.requestStatus] || [];
  };

  const getStatusButtonLabel = (status: string) => {
    return t(`certificationRequest.statusOptions.${status}`) || status;
  };

  const printBill = async (request: CertificationRequest) => {
    if (request.requestStatus !== "PAYMENT_PENDING") {
      showToast("warn", t("common.warning"), "Bill can be printed only when payment is pending.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const companyName = getCompanyName() || "";
    const billAmount = (request as any).paymentAmount || "To be determined";

    const billContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Bill - ${request.serialNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; margin: 0; }
          .bill-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .bill-title { font-size: 28px; font-weight: bold; margin: 20px 0; text-align: center; }
          .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .details-table td, .details-table th { padding: 12px; border: 1px solid #ddd; }
          .details-table th { background-color: #f5f5f5; font-weight: bold; width: 40%; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: right; margin-top: 20px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
          .payment-instructions { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #007bff; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <div class="company-name">${companyName || "Certification Authority"}</div>
            <div>Payment Invoice / Bill</div>
          </div>

          <div class="bill-title">PAYMENT INVOICE</div>

          <table class="details-table">
            <tr><th>Serial Number</th><td>${request.serialNumber || "-"}</td></tr>
            <tr><th>Tracking Number</th><td>${request.trackingNumber || "-"}</td></tr>
            <tr><th>Company Name</th><td>${companyName || "-"}</td></tr>
            <tr><th>Request Type</th><td>${getCertificationTypeLabel(request.certificationType)}</td></tr>
            <tr><th>Payment Amount</th><td>${billAmount}</td></tr>
            <tr><th>Payment Status</th><td>Pending</td></tr>
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

          <div class="amount">Total Amount: ${billAmount}</div>

          <div class="footer">
            This is a system generated invoice. For any queries, please contact support.<br/>
            Generated on: ${new Date().toLocaleString()}
          </div>
        </div>

        <div class="no-print" style="text-align:center; margin-top:20px;">
          <button onclick="window.print()" style="padding:10px 20px; font-size:16px;">Print Bill</button>
          <button onclick="window.close()" style="padding:10px 20px; font-size:16px; margin-left:10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(billContent);
    printWindow.document.close();
    setRequestPrinted(true);

    await handleApi(
      () => CertificationRequestService.updateIsPrint(request.id, true),
      () => {},
      (message: string) => showToast("error", t("common.error"), message),
      t,
    );
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
      (request as any).paymentAmount ? String((request as any).paymentAmount) : "",
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
    formData.append("paymentDate", paymentDate ? `${paymentDate}T00:00:00` : new Date().toISOString());
    formData.append("paymentAmount", paymentAmount || "");

    const handlePaymentError = (message: string) => {
      showToast("error", t("common.error"), message);
    };

    const response = await handleApi(
      () => CertificationRequestService.confirmPayment(request.id, formData),
      () => showToast("success", t("common.success"), "Scanned bill uploaded successfully."),
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
      STANDARDS_REQUIRED:
        t("certificationRequest.standardRequired") ||
        "Standards will be required for this request.",
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
      standardFile?: File | null;
      startDate?: Date | null;
      endDate?: Date | null;
      committeeId?: number | null;
    },
  ) => {
    if (!request?.id) return;

    const cleanReason = options?.rejectionReason?.trim() || "";

    const showSuccess = () => {
      showToast(
        "success",
        t("common.success"),
        getStatusButtonLabel(nextStatus),
      );
    };

    const showError = (message: string) => {
      showToast("error", t("common.error"), message);
    };

    let response;

    if (nextStatus === "REJECTED") {
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
    } else if (nextStatus === "STANDARDS_PROVIDED") {
      if (!options?.standardFile) {
        showToast(
          "warn",
          t("common.warning"),
          t("attachment.STANDARD") || "Please upload standard file",
        );
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
    } else if (nextStatus === "DEADLINE_ASSIGNED") {
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
    } else if (nextStatus === "INSPECTION_IN_PROGRESS") {
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
            nextStatus,
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
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setRejectionReason("");
      loadRequestDetail();
    }
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
    };
    return types[type] || type;
  };

  const confirmStatusUpdate = (nextStatus: string) => {
    const isReject = nextStatus === "REJECTED";
    const isStandardProvided = nextStatus === "STANDARDS_PROVIDED";
    const isDeadlineAssigned = nextStatus === "DEADLINE_ASSIGNED";
    const isInspectionInProgress = nextStatus === "INSPECTION_IN_PROGRESS";

    const requestType = getCertificationTypeLabel(
      request?.certificationType || "",
    );
    const requestId = request?.serialNumber || request?.trackingNumber || "";
    const companyName = getCompanyName() || "";

    // Reset dialog states
    setSelectedCommitteeId(null);
    setSelectedStandardFile(null);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setRejectionReason("");

    confirmDialog({
      message: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    {t("certificationRequest.labels.requestType")}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {requestType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    {t("certificationRequest.labels.serialNumber")}
                  </span>
                  <span className="text-sm font-mono font-medium text-gray-800">
                    {requestId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    {t("company.labels.companyName")}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {companyName}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-4 rounded-lg text-sm bg-amber-50 border border-amber-100">
                {isReject && (
                  <div className="flex flex-col gap-3">
                    <div className="w-full mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("certificationRequest.rejectReason") ||
                          "Rejection Reason"}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={
                          t("certificationRequest.enterRejectionReason") ||
                          "Please provide a reason for rejection..."
                        }
                        className="w-full min-h-25 rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 resize-y"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {isStandardProvided && (
                  <div className="flex flex-col gap-3">
                    <FileUploadField
                      label={t("attachment.STANDARD")}
                      accept=".pdf,.jpg,.png"
                      maxFileSize={5000000}
                      required
                      onFileSelect={(file) => {
                        setSelectedStandardFile(file);
                      }}
                    />
                  </div>
                )}

                {isDeadlineAssigned && (
                  <>
                    <Dropdown
                      className="w-full mt-3"
                      value={calendarType}
                      options={[
                        { label: "Gregorian", value: "gregorian" },
                        { label: "Hijri", value: "arabic" },
                        { label: "Shamsi", value: "persian" },
                      ]}
                      onChange={(e) => setCalendarType(e.value)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <SmartDatePicker
                        label={t("deadline.startDate")}
                        value={selectedStartDate ?? undefined}
                        calendarType={calendarType}
                        onChange={(d: any) => {
                          setSelectedStartDate(
                            d ? new Date(d?.date || d) : null,
                          );
                        }}
                      />

                      <SmartDatePicker
                        label={t("deadline.endDate")}
                        value={selectedEndDate ?? undefined}
                        calendarType={calendarType}
                        onChange={(d: any) => {
                          setSelectedEndDate(d ? new Date(d?.date || d) : null);
                        }}
                      />
                    </div>
                  </>
                )}

                {isInspectionInProgress && (
                  <Dropdown
                    className="w-full mt-3"
                    value={selectedCommitteeId}
                    options={committees.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    onChange={(e) => {
                      setSelectedCommitteeId(e.value);
                    }}
                    placeholder={t("commitee.selectCommittee")}
                  />
                )}

                {!isReject &&
                  !isStandardProvided &&
                  !isDeadlineAssigned &&
                  !isInspectionInProgress && (
                    <div className="flex flex-col items-center justify-center text-center ">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <strong>{getStatusButtonLabel(nextStatus)}</strong>
                      </div>
                      <span>{getStatusConfirmationMessage(nextStatus)}</span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      ),
      header: (
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 bg-white rounded-t-xl">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isReject ? "bg-red-100" : "bg-green-100"
            }`}
          >
            {isReject ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {getStatusButtonLabel(nextStatus)}
          </span>
        </div>
      ),
      accept: () => {
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

        handleStatusUpdate(nextStatus, {
          rejectionReason: isReject ? rejectionReason : null,
          standardFile: isStandardProvided ? selectedStandardFile : null,
          startDate: isDeadlineAssigned ? selectedStartDate : null,
          endDate: isDeadlineAssigned ? selectedEndDate : null,
          committeeId: isInspectionInProgress ? selectedCommitteeId : null,
        });
      },
      acceptLabel: isReject
        ? `✗ ${getStatusButtonLabel("REJECTED")}`
        : `✓ ${getStatusButtonLabel(nextStatus)}`,
      acceptClassName: isReject
        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        : "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md",
      rejectLabel: t("common.cancel") || "Cancel",
      rejectClassName:
        "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400",
      defaultFocus: "reject",
      closeOnEscape: true,
      dismissableMask: true,
      draggable: false,
      resizable: false,
      style: { width: "650px", maxWidth: "95vw" },
      breakpoints: { "960px": "95vw", "640px": "95vw" },
      className: "rounded-xl shadow-2xl border border-gray-200",
    });
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
      STANDARDS_REQUIRED: {
        color: "text-rose-700",
        bgColor: "bg-rose-100",
        icon: <AlertCircle className="h-4 w-4" />,
        label: t("certificationRequest.statusOptions.STANDARDS_REQUIRED"),
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return (
    <div className="min-h-screen bg-gray-50  pb-10">
      <ConfirmDialog />
      <div className="container mx-auto px-4 max-w-7xl">
        <Dialog

          header={
            request?.requestStatus === "PAYMENT_PENDING" && !request?.isScanned
              ? t("certificationRequest.uploadScannedBill") || "Upload Scanned Bill"
              : t("certificationRequest.paymentDetails") || "Payment Details"
          }
          visible={paymentDialogVisible}
          onHide={closePaymentDialog}
          style={{ width: "750px",borderRadius:"15px" }}
          draggable={true}
    
          resizable={true}
        >
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                {t("certificationRequest.requestInformation") || "Request Information"}
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
                <div>
                  <span className="block text-xs text-gray-500">
                    {t("certificationRequest.labels.status") || "Status"}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      request.requestStatus === "PAYMENT_COMPLETED" || request.isScanned
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {request.requestStatus === "PAYMENT_COMPLETED" || request.isScanned
                      ? t("certificationRequest.paymentCompleted") || "Payment Completed"
                      : t("certificationRequest.paymentPending") || "Payment Pending"}
                  </span>
                </div>
              </div>
            </div>

            {request.requestStatus === "PAYMENT_PENDING" && !request.isScanned && (
              <div className="rounded-lg border border-blue-100 bg-white p-2">
                <h3 className="mb-3 text-base font-semibold text-gray-800">
                  {t("certificationRequest.scanUploadInformation") || "Scan Upload Information"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("certificationRequest.transactionId") || "Transaction ID"} *
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder={t("certificationRequest.transactionId") || "Transaction ID"}
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
                      {t("certificationRequest.paymentAmount") || "Payment Amount"}
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={t("certificationRequest.paymentAmount") || "Payment Amount"}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
             
                </div>
                     <div className="pt-3">
                    <FileUploadField
                      label={t("certificationRequest.scannedBill") || "Scanned Bill"}
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
                      : t("certificationRequest.uploadScannedBill") || "Upload Scanned Bill"}
                  </button>
                </div>
              </div>
            )}

            {(request.requestStatus === "PAYMENT_COMPLETED" || request.isScanned) && (
              <div className="rounded-lg border border-green-100 bg-white p-4 text-sm text-gray-900">
                <h3 className="mb-3 text-base font-semibold text-gray-800">
                  {t("certificationRequest.paymentDetails") || "Payment Details"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500">
                      {t("certificationRequest.transactionId") || "Transaction ID"}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(request as any).transactionId || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">
                      {t("certificationRequest.paymentDate") || "Payment Date"}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(request as any).paymentDate
                        ? new Date((request as any).paymentDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">
                      {t("certificationRequest.paymentAmount") || "Payment Amount"}
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
                        href={(request as any).paymentReceiptUrl || (request as any).receiptFilePath || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 rounded-md text-sm ${
                          (request as any).paymentReceiptUrl || (request as any).receiptFilePath
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
          statusConfig={statusConfig}
          finalStates={finalStates}
          getNextStatuses={getNextStatuses}
          getStatusButtonLabel={getStatusButtonLabel}
          getCertificationTypeLabel={getCertificationTypeLabel}
          onBack={() => navigate(-1)}
          onStatusAction={confirmStatusUpdate}
          onPrintBill={() => printBill(request)}
          onOpenPaymentDialog={openPaymentDialog}
          canUploadScannedBillButton={
            request.requestStatus === "PAYMENT_PENDING" &&
            !request.isScanned &&
            ((request as any).isPrint || (request as any).isPrinted || requestPrinted)
          }
          showPaymentDetailsAction={
            Boolean(request.isScanned || request.requestStatus === "PAYMENT_COMPLETED")
          }
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
      </div>
    </div>
  );
};

export default CertificationRequestView;
