import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Hash,
  Calendar,
  XCircle,
} from "lucide-react";
import type {
  CertificationRequest,
  StatusConfig,
} from "./CertificationRequestView.types";
import { useAuth } from "../../../../context/AuthContext";
import { IslamicDateFormatter } from "../../../common/datepicker/IslamicDateFormatter";
import DynamicBreadcrumb from "../../../common/DynamicBreadcrumb";

interface Props {
  request: CertificationRequest;
  listUrl: string;
  statusConfig: StatusConfig;
  finalStates: string[];
  getNextStatuses: () => string[];
  getStatusButtonLabel: (status: string) => string;
  getCertificationTypeLabel: (type: string) => string;
  onBack: () => void;
  onStatusAction: (nextStatus: string) => void;
  onDownloadPdf: () => void;
  onPrintBill: () => void;
  onOpenPaymentDialog: () => void;
  onOpenContractDialog?: () => void;
  onOpenInspectionPaymentDialog?: () => void;
  canUploadScannedBillButton: boolean;
  showPaymentDetailsAction: boolean;
  t: any;
}

const CertificationRequestViewHeader: React.FC<Props> = ({
  request,
  listUrl,
  statusConfig,
  finalStates,
  getNextStatuses,
  getStatusButtonLabel,
  getCertificationTypeLabel,
  onBack,
  onStatusAction,
  onDownloadPdf,
  onPrintBill,
  onOpenPaymentDialog,
  onOpenContractDialog,
  onOpenInspectionPaymentDialog,

  t,
}) => {
  const { hasPermission } = useAuth();
  const [willProcessPayment, setWillProcessPayment] = useState<boolean | null>(null);
  const breadcrumbItems = [
    {
      label: t("certificationRequest.list"),
      url: listUrl,
    },
    {
      label: request.serialNumber,
      url: "",
    },
  ];
  return (
    <div className="mb-6">
      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="max-w-8xl"
        radius="rounded-2xl"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {getCertificationTypeLabel(request.certificationType)}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                {statusConfig.icon}
                {statusConfig.label === "COMMITTEE_REPORTED" ||
                statusConfig.label === "COMMITTEE_APPROVED"
                  ? t(
                      `certificationRequest.statusOptions.${statusConfig.label}`,
                    )
                  : statusConfig.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>
                  {t("certificationRequest.labels.serialNumber")}:{" "}
                  {request.serialNumber}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>
                  {t("certificationRequest.labels.trackingNumber")}:{" "}
                  {request.trackingNumber}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("certificationRequest.labels.createdDate")}:{" "}
                  {IslamicDateFormatter.formatQamari(request.createdDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:w-auto">
            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex h-11 w-full shrink-0 items-center justify-center self-start rounded-lg border-2 border-gray-400 px-6 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("common.download")}
            </button>
            {hasPermission("UPDATE_CERTIFICATIONREQUEST") && (
              <>
              {request.requestStatus === "COMMITTEE_APPROVED" && (
                <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <span className="px-2 text-sm font-medium text-amber-900 sm:shrink-0">
                    {t("certificationRequest.savePaymentPrompt")}
                  </span>
                  <div className="flex flex-row flex-wrap items-center gap-2">
                    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-blue-600 bg-white px-3 py-2 text-sm font-medium text-blue-700">
                      <input
                        type="checkbox"
                        checked={willProcessPayment === true}
                        onChange={(event) =>
                          setWillProcessPayment(
                            event.target.checked ? true : null,
                          )
                        }
                        className="h-4 w-4 accent-blue-600"
                      />
                      {t("certificationRequest.paymentChoiceYes")}
                    </label>
                    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-orange-600 bg-white px-3 py-2 text-sm font-medium text-orange-700">
                      <input
                        type="checkbox"
                        checked={willProcessPayment === false}
                        onChange={(event) =>
                          setWillProcessPayment(
                            event.target.checked ? false : null,
                          )
                        }
                        className="h-4 w-4 accent-orange-600"
                      />
                      {t("certificationRequest.paymentChoiceNo")}
                    </label>
                  </div>
                  {willProcessPayment === true && (
                    <button
                      type="button"
                      onClick={() => onStatusAction("PAYMENT_PENDING")}
                      className="w-full rounded-lg border-2 border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 sm:w-auto"
                    >
                      {getStatusButtonLabel("PAYMENT_PENDING")}
                    </button>
                  )}
                  {willProcessPayment === false && (
                    <button
                      type="button"
                      onClick={() => onStatusAction("AUTHORITY_DECISION")}
                      className="w-full rounded-lg border-2 border-orange-600 bg-white px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 sm:w-auto"
                    >
                      {getStatusButtonLabel("AUTHORITY_DECISION")}
                    </button>
                  )}
                </div>
              )}
              {request.requestStatus === "PAYMENT_PENDING" && (
                <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2 sm:flex-row sm:items-center">
                  <span className="px-2 text-sm font-medium text-amber-900">
                    {t("certificationRequest.paymentChoicePrompt")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      request.isPrint ? onOpenPaymentDialog() : onPrintBill()
                    }
                    className="rounded-lg border border-blue-600 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    {t("certificationRequest.processPayment")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusAction("AUTHORITY_DECISION")}
                    className="rounded-lg border border-orange-600 bg-white px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50"
                  >
                    {t("certificationRequest.skipPaymentAndContinue")}
                  </button>
                </div>
              )}
              {request.certificationScope === "INTERNATIONAL" &&
                request.requestStatus === "CONTRACT_PENDING" &&
                onOpenContractDialog && (
                  <button
                    type="button"
                    onClick={onOpenContractDialog}
                    className="flex items-center justify-center px-6 py-2.5 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t("internationalWorkflow.openContractForm")}
                  </button>
                )}
              {request.certificationScope === "INTERNATIONAL" &&
                request.requestStatus === "INSPECTION_PAYMENT_PENDING" &&
                onOpenInspectionPaymentDialog && (
                  <button
                    type="button"
                    onClick={onOpenInspectionPaymentDialog}
                    className="flex items-center justify-center px-6 py-2.5 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t("internationalWorkflow.completeInspectionPayment")}
                  </button>
                )}
              {!finalStates.includes(request.requestStatus) &&
                getNextStatuses()
                  .filter(
                    (status) =>
                      status !== "REJECTED" &&
                      !(
                        request.requestStatus === "COMMITTEE_APPROVED" &&
                        (status === "PAYMENT_PENDING" ||
                          status === "AUTHORITY_DECISION")
                      ),
                  )
                  .map((nextStatus) => {
                  const isReject = nextStatus === "REJECTED";

                  return (
                    <div>
                      {nextStatus != "PAYMENT_COMPLETED" &&
                        hasPermission("UPDATE_CERTIFICATIONREQUEST") && (
                          <button
                            key={nextStatus}
                            onClick={() => onStatusAction(nextStatus)}
                            className={`flex items-center justify-center px-4 py-2.5 border-2 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto ${
                              isReject
                                ? "border-red-600 text-red-700 hover:bg-red-50 active:bg-red-100"
                                : "border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100"
                            }`}
                          >
                            {isReject ? (
                              <XCircle className="h-4 w-4 mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {getStatusButtonLabel(nextStatus)}
                          </button>
                        )}
                    </div>
                  );
                })}
              {request.requestStatus === "PAYMENT_PENDING" && (
                <>
                  {request.isScanned === false &&
                    request.isPrint === true &&
                    hasPermission("UPDATE_CERTIFICATIONREQUEST") && (
                      <button
                        type="button"
                        onClick={onOpenPaymentDialog}
                        className="flex items-center justify-center px-6 py-2.5 border-2 border-gray-600 text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t("certificationRequest.uploadScannedBill") ||
                          "Upload Scanned Bill"}
                      </button>
                    )}

                  {request.isScanned === true &&
                    hasPermission("UPDATE_CERTIFICATIONREQUEST") && (
                      <button
                        type="button"
                        onClick={onOpenPaymentDialog}
                        className="flex items-center justify-center px-6 py-2.5 border-2 border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t("certificationRequest.paymentCompleted") ||
                          "Payment Completed"}
                      </button>
                    )}
                </>
              )}
              {request.requestStatus === "PAYMENT_COMPLETED" &&
                hasPermission("UPDATE_CERTIFICATIONREQUEST") && (
                  <button
                    type="button"
                    onClick={onOpenPaymentDialog}
                    className="flex items-center justify-center px-6 py-2.5 border-2 border-gray-600 text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t("certificationRequest.viewPaymentDetails") ||
                      "View Payment Details"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationRequestViewHeader;
