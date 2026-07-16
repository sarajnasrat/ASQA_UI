import React from "react";
import { FileText, Building2, File, Eye, Download } from "lucide-react";
import type { CertificationRequest } from "./CertificationRequestView.types";

interface Props {
  request: CertificationRequest;
  formatFileSize: (bytes: number) => string;
  apiBaseUrl: string;
  t: any;
}

const CertificationRequestViewDocuments: React.FC<Props> = ({
  request,
  formatFileSize,
  apiBaseUrl,
  t,
}) => {
  const companyAttachments = [...(request.company?.attachments ?? [])].reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t("certificationRequest.requestAttachments")} ({request.attachments?.length || 0})
        </h3>
        {request.attachments && request.attachments.length > 0 ? (
          <div className="space-y-3">
            {request.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <File className="h-5 w-5 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 truncate">
                        {attachment.attachmentName}
                      </p>
                      {attachment.attachmentReferenceType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                          {t(`attachment.type.${attachment.attachmentReferenceType}`)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={`${apiBaseUrl}${attachment.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    title={t("common.view")}
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={`${apiBaseUrl}${attachment.file}`}
                    download
                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    title={t("common.download")}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
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
            {companyAttachments.map((attachment, index) => {
              const isCurrentDocument = index === 0;

              return (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">
                        {attachment.attachmentName}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          isCurrentDocument
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isCurrentDocument
                          ? t("common.currentDocument")
                          : t("common.oldDocument")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`${apiBaseUrl}${attachment.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    title={t("common.view")}
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={`${apiBaseUrl}${attachment.file}`}
                    download
                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    title={t("common.download")}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("common.noDocuments")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationRequestViewDocuments;
