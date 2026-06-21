import React from "react";
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
  statusConfig: StatusConfig;
  finalStates: string[];
  getNextStatuses: () => string[];
  getStatusButtonLabel: (status: string) => string;
  getCertificationTypeLabel: (type: string) => string;
  onBack: () => void;
  onStatusAction: (nextStatus: string) => void;
  onPrintBill: () => void;
  onOpenPaymentDialog: () => void;
  canUploadScannedBillButton: boolean;
  showPaymentDetailsAction: boolean;
  t: any;
}

const CertificationRequestViewHeader: React.FC<Props> = ({
  request,
  statusConfig,
  finalStates,
  getNextStatuses,
  getStatusButtonLabel,
  getCertificationTypeLabel,
  onBack,
  onStatusAction,
  onPrintBill,
  onOpenPaymentDialog,

  t,
}) => {
  const { hasPermission } = useAuth();
  const getBreadcrumbListUrl = (status: string) => {
    switch (status) {
      case "PAYMENT_PENDING":
      case "PAYMENT_COMPLETED":
        return "/payment-management";
      case "DEADLINE_REQUIRED":
      case "DEADLINE_ASSIGNED":
      case "INSPECTION_IN_PROGRESS":
        return "/certification-request-deadline";
      case "UNDER_REVIEW":
      case "REJECTED":
      case "REPORT_APPROVED":
      case "CERTIFICATE_ISSUED":
      default:
        return "/certification-request";
    }
  };

  const breadcrumbItems = [
    {
      label: t("certificationRequest.list"),
      url: getBreadcrumbListUrl(request.requestStatus),
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
                {statusConfig.label}
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
          {hasPermission("UPDATE_CERTIFICATIONREQUEST") && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {!finalStates.includes(request.requestStatus) &&
                getNextStatuses().map((nextStatus) => {
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
                  {request.isPrint === false && (
                    <button
                      type="button"
                      onClick={onPrintBill}
                      className="flex items-center justify-center px-6 py-2.5 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("certificationRequest.printBill") || "Print Bill"}
                    </button>
                  )}

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
              {/* <button className="flex items-center justify-center px-6 py-2.5 border-2 border-gray-400 text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-medium rounded-lg transition-all duration-200 w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              {t("common.download")}
            </button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationRequestViewHeader;
