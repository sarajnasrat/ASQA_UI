import React from "react";
import {
  Building2,
  CreditCard,
  Download,
  Eye,
  File,
  FileText,
} from "lucide-react";
import type { Assignment } from "./CommiteeAssignmentView.types";

interface Props {
  assignment: Assignment;
  formatFileSize: (bytes?: number | null) => string;
  formatDate: (value?: string | null) => string;
  apiBaseUrl: string;
  t: any;
}

const ActionLinks = ({ href, t }: { href: string; t: any }) => (
  <div className="flex gap-2 shrink-0">
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
      title={t("common.view")}
    >
      <Eye className="h-4 w-4" />
    </a>
    <a
      href={href}
      download
      className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
      title={t("common.download")}
    >
      <Download className="h-4 w-4" />
    </a>
  </div>
);

const CommiteeAssignmentViewDocuments: React.FC<Props> = ({
  assignment,
  formatFileSize,
  formatDate,
  apiBaseUrl,
  t,
}) => {
  const request = assignment.certificationRequest;
  const requestAttachments = request?.attachments || [];
  const companyAttachments = request?.company?.attachments || [];
  const payments = request?.payments || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t("certificationRequest.requestAttachments")} ({requestAttachments.length})
        </h3>
        {requestAttachments.length > 0 ? (
          <div className="space-y-3">
            {requestAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <File className="h-5 w-5 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {attachment.attachmentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>
                </div>
                <ActionLinks href={`${apiBaseUrl}${attachment.file}`} t={t} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("common.noDocuments")}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          {t("company.labels.companyAttachments")} ({companyAttachments.length})
        </h3>
        {companyAttachments.length > 0 ? (
          <div className="space-y-3">
            {companyAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <File className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {attachment.attachmentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>
                </div>
                <ActionLinks href={`${apiBaseUrl}${attachment.file}`} t={t} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("common.noDocuments")}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          {t("commitee.assignment.payments")} ({payments.length})
        </h3>
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <p className="font-medium text-gray-900">
                  {payment.transactionId || `#${payment.id}`}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {payment.paymentAmount ?? "-"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(payment.paymentDate || payment.createdDate)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {t("commitee.assignment.noPaymentRecords")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommiteeAssignmentViewDocuments;
