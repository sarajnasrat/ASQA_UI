import { useCallback, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import { CheckCircle, FileText } from "lucide-react";
import CertificationRequestService from "../../../../services/CertificationReques.service";
import type {
  CertificationContract,
  CertificationRequest,
} from "../certification-process/CertificationRequestView.types";
import FileUploadField from "../../../common/FileUploadField";
import { SmartDatePicker } from "../../../common/datepicker/SmartDatePicker";

type CalendarType = "gregorian" | "persian" | "arabic";

type Props = {
  request: CertificationRequest;
  onChanged: () => void;
  showToast: (
    severity: "success" | "error" | "warn",
    summary: string,
    detail: string,
  ) => void;
  contractDialogVisible: boolean;
  onContractDialogVisibleChange: (visible: boolean) => void;
  inspectionPaymentDialogVisible: boolean;
  onInspectionPaymentDialogVisibleChange: (visible: boolean) => void;
  onContractCompleted: () => void;
  onInspectionPaymentCompleted: () => void;
};

export default function InternationalWorkflowPanel({
  request,
  onChanged,
  showToast,
  contractDialogVisible,
  onContractDialogVisibleChange,
  inspectionPaymentDialogVisible,
  onInspectionPaymentDialogVisibleChange,
  onContractCompleted,
  onInspectionPaymentCompleted,
}: Props) {
  const { t } = useTranslation();
  const [contract, setContract] = useState<CertificationContract | null>(null);
  const [saving, setSaving] = useState(false);
  const [contractNumber, setContractNumber] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarType, setCalendarType] =
    useState<CalendarType>("persian");
  const [remarks, setRemarks] = useState("");
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [paymentCalendarType, setPaymentCalendarType] =
    useState<CalendarType>("persian");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [completeDialogVisible, setCompleteDialogVisible] = useState(false);

  const errorMessage = (error: unknown, fallback: string) => {
    const value = error as {
      message?: string;
      response?: {
        status?: number;
        data?: { statusCode?: number; message?: string };
      };
    };
    return value.response?.data?.message || value.message || fallback;
  };

  const loadContract = useCallback(async () => {
    try {
      const response = await CertificationRequestService.getContract(
        request.id,
      );
      const value = response.data?.data as CertificationContract | undefined;
      if (value) {
        setContract(value);
        setContractNumber(value.contractNumber);
        setStartDate(new Date(value.startDate));
        setEndDate(new Date(value.endDate));
        setRemarks(value.remarks || "");
      }
    } catch {
      // A contract does not exist before the request enters its contract stage.
      setContract(null);
    }
  }, [request.id]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  const saveContract = async (complete: boolean) => {
    if (!contractNumber.trim() || !startDate || !endDate) {
      showToast(
        "warn",
        t("internationalWorkflow.required"),
        t("internationalWorkflow.contractRequired"),
      );
      return;
    }
    if (endDate <= startDate) {
      showToast(
        "warn",
        t("internationalWorkflow.invalidDates"),
        t("internationalWorkflow.endDateAfterStart"),
      );
      return;
    }
    if (complete && !contractFile && !contract?.attachmentId) {
      showToast(
        "warn",
        t("internationalWorkflow.fileRequired"),
        t("internationalWorkflow.contractFileRequired"),
      );
      return;
    }
    const data = new FormData();
    data.append("contractNumber", contractNumber.trim());
    data.append("startDate", startDate.toISOString());
    data.append("endDate", endDate.toISOString());
    data.append("remarks", remarks);
    data.append("complete", String(complete));
    if (contractFile) data.append("file", contractFile);
    try {
      setSaving(true);
      const response = await CertificationRequestService.saveContract(
        request.id,
        data,
      );
      if (response.data?.success === false)
        throw new Error(
          response.data?.message ||
            t("internationalWorkflow.contractSaveFailed"),
        );
      showToast(
        "success",
        t("common.success"),
        complete
          ? t("internationalWorkflow.contractCompleted")
          : t("internationalWorkflow.draftSaved"),
      );
      if (complete) {
        onContractDialogVisibleChange(false);
        setCompleteDialogVisible(false);
        onContractCompleted();
        return;
      }
      await loadContract();
      onChanged();
    } catch (error: unknown) {
      showToast(
        "error",
        t("common.error"),
        errorMessage(error, t("internationalWorkflow.contractSaveFailed")),
      );
    } finally {
      setSaving(false);
    }
  };

  const requestCompleteContract = () => {
    if (
      !contractNumber.trim() ||
      !startDate ||
      !endDate ||
      endDate <= startDate ||
      (!contractFile && !contract?.attachmentId)
    ) {
      void saveContract(true);
      return;
    }
    setCompleteDialogVisible(true);
  };

  const completeInspectionPayment = async () => {
    if (!transactionId.trim()) {
      showToast(
        "warn",
        t("internationalWorkflow.required"),
        t("internationalWorkflow.transactionRequired"),
      );
      return;
    }
    const data = new FormData();
    data.append("transactionId", transactionId.trim());
    if (paymentDate) data.append("paymentDate", paymentDate.toISOString());
    if (paymentAmount) data.append("paymentAmount", paymentAmount);
    if (paymentFile) data.append("file", paymentFile);
    try {
      setSaving(true);
      const response =
        await CertificationRequestService.completeInspectionPayment(
          request.id,
          data,
        );
      if (response.data?.success === false)
        throw new Error(
          response.data?.message || t("internationalWorkflow.paymentFailed"),
        );
      showToast(
        "success",
        t("common.success"),
        t("internationalWorkflow.inspectionPaymentCompleted"),
      );
      onInspectionPaymentDialogVisibleChange(false);
      onInspectionPaymentCompleted();
    } catch (error: unknown) {
      showToast(
        "error",
        t("common.error"),
        errorMessage(error, t("internationalWorkflow.paymentFailed")),
      );
    } finally {
      setSaving(false);
    }
  };

  if (request.certificationScope !== "INTERNATIONAL") return null;

  return (
    <>
      {request.requestStatus === "CONTRACT_PENDING" && (
        <Dialog
          header={t("internationalWorkflow.completeContract")}
          visible={contractDialogVisible}
          onHide={() => onContractDialogVisibleChange(false)}
          style={{ width: "900px", borderRadius: "30px" }}
          draggable
          resizable
        >
          <div className="space-y-5">
            <div className="">
            
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("internationalWorkflow.contractNumber")} *
                  </label>
                  <input
                    placeholder={t(
                      "internationalWorkflow.placeholders.contractNumber",
                    )}
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                    <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("common.selectDateType")} *
                  </label>
                  <Dropdown
                    className="w-full"
                    value={calendarType}
                    options={[
                      { label: t("common.gregorian"), value: "gregorian" },
                      { label: t("common.arabic"), value: "arabic" },
                      { label: t("common.persian"), value: "persian" },
                    ]}
                    onChange={(event) => setCalendarType(event.value)}
                  />
                </div>
                <div>
                  <SmartDatePicker
                    label={`${t("internationalWorkflow.startDate")} *`}
                    value={startDate ?? undefined}
                    calendarType={calendarType}
                    key={`contract-start-date-${calendarType}`}
                    onChange={(date: any) =>
                      setStartDate(date ? new Date(date?.date || date) : null)
                    }
                  />
                </div>
                <div>
                  <SmartDatePicker
                    label={`${t("internationalWorkflow.endDate")} *`}
                    value={endDate ?? undefined}
                    calendarType={calendarType}
                    key={`contract-end-date-${calendarType}`}
                    onChange={(date: any) =>
                      setEndDate(date ? new Date(date?.date || date) : null)
                    }
                  />
                </div>
            
           
                <div className="md:col-span-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("internationalWorkflow.remarks")}
                  </label>
                  <textarea
                    placeholder={t(
                      "internationalWorkflow.placeholders.remarks",
                    )}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                     <div className="md:col-span-4">
                  <FileUploadField
                    key={`contract-upload-${contractDialogVisible}-${request.id}`}
                    label={t("internationalWorkflow.contractFile")}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    maxFileSize={10000000}
                    required={!contract?.attachmentId}
                    onFileSelect={setContractFile}
                    existingFileName={contract?.attachmentName}
                  />
                </div>
              </div>
              {contract?.attachmentName && (
                <p className="mt-3 flex items-center gap-2 text-sm text-green-700">
                  <FileText size={16} />
                  {contract.attachmentName}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onContractDialogVisibleChange(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={requestCompleteContract}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("internationalWorkflow.saveAndComplete")}
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {request.requestStatus === "INSPECTION_PAYMENT_PENDING" && (
        <Dialog
          header={t("internationalWorkflow.completeInspectionPayment")}
          visible={inspectionPaymentDialogVisible}
          onHide={() => onInspectionPaymentDialogVisibleChange(false)}
          modal
          dismissableMask
          style={{ width: "46rem", maxWidth: "95vw" }}
        >
          <div className="grid gap-4 md:grid-cols-2">
       
            <label className="text-sm">
              <span className="mb-2 block font-medium text-gray-700">
                {t("internationalWorkflow.transactionId")}
              </span>
              <input
                placeholder={t(
                  "internationalWorkflow.placeholders.transactionId",
                )}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-2 block font-medium text-gray-700">
                {t("internationalWorkflow.amount")}
              </span>
              <input
                placeholder={t("internationalWorkflow.placeholders.amount")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </label>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                   <div className="text-sm">
                <label className="mb-2 block font-medium text-gray-700">
                  {t("common.selectDateType")} *
                </label>
                <Dropdown
                  className="w-full"
                  value={paymentCalendarType}
                  options={[
                    { label: t("common.gregorian"), value: "gregorian" },
                    { label: t("common.arabic"), value: "arabic" },
                    { label: t("common.persian"), value: "persian" },
                  ]}
                  onChange={(event) => setPaymentCalendarType(event.value)}
                />
              </div>
              <SmartDatePicker
                label={t("internationalWorkflow.paymentDate")}
                value={paymentDate ?? undefined}
                calendarType={paymentCalendarType}
                key={`payment-date-${paymentCalendarType}`}
                onChange={(date: any) =>
                  setPaymentDate(date ? new Date(date?.date || date) : null)
                }
              />
         
            </div>
            <FileUploadField
              key={`payment-upload-${inspectionPaymentDialogVisible}-${request.id}`}
              label={t("internationalWorkflow.paymentReceipt")}
              accept="image/*,application/pdf"
              maxFileSize={5000000}
              onFileSelect={setPaymentFile}
              className="md:col-span-2"
            />
            <button
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white md:col-span-2 md:w-fit"
              onClick={completeInspectionPayment}
            >
              {t("internationalWorkflow.completeInspectionPayment")}
            </button>
          </div>
        </Dialog>
      )}
      <Dialog
        header={t("internationalWorkflow.completeContract")}
        visible={completeDialogVisible}
        onHide={() => setCompleteDialogVisible(false)}
        modal
        dismissableMask
        style={{ width: "32rem", maxWidth: "95vw" }}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t("internationalWorkflow.completeConfirmation")}
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="rounded border px-4 py-2"
              onClick={() => setCompleteDialogVisible(false)}
            >
              {t("common.cancel")}
            </button>
            <button
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white"
              onClick={() => {
                setCompleteDialogVisible(false);
                void saveContract(true);
              }}
            >
              {t("internationalWorkflow.confirmComplete")}
            </button>
          </div>
        </div>
      </Dialog>

      {!["CONTRACT_PENDING", "INSPECTION_PAYMENT_PENDING"].includes(
        request.requestStatus,
      ) &&
        contract && (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle size={17} />
            {t("internationalWorkflow.completedSummary", {
              number: contract.contractNumber,
              start: contract.startDate,
              end: contract.endDate,
            })}
          </p>
        )}
    </>
  );
}
