import React from "react";
import {
  Building2,
  CreditCard,
  Download,
  Eye,
  File,
  FileText,
  Image,
  Music,
  PlayCircle,
  Video,
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

const mediaKind = (attachment: any) => {
  const type = String(attachment.fileType || "").toLowerCase();
  const name = String(attachment.attachmentName || attachment.file || "").toLowerCase();
  if (type.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv)$/i.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)) return "audio";
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(name)) return "image";
  return "document";
};

const AttachmentCard = ({ attachment, apiBaseUrl, formatFileSize, t }: any) => {
  const href = `${apiBaseUrl}${attachment.file}`;
  const kind = mediaKind(attachment);
  const Icon = kind === "video" ? Video : kind === "audio" ? Music : kind === "image" ? Image : FileText;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition hover:border-blue-200 hover:bg-blue-50/30">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kind === "video" ? "bg-violet-100 text-violet-600" : kind === "audio" ? "bg-amber-100 text-amber-600" : kind === "image" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p dir="auto" className="font-medium text-gray-900 whitespace-normal [overflow-wrap:anywhere]" title={attachment.attachmentName}>{attachment.attachmentName}</p>
            <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)} · {kind}</p>
          </div>
        </div>
        <ActionLinks href={href} t={t} />
      </div>
      {kind === "video" && <video controls preload="metadata" className="max-h-56 w-full bg-black" src={href} />}
      {kind === "audio" && <div className="px-3 pb-3"><audio controls preload="metadata" className="w-full" src={href} /></div>}
      {kind === "image" && <a href={href} target="_blank" rel="noopener noreferrer" className="block px-3 pb-3"><img src={href} alt={attachment.attachmentName} className="max-h-48 w-full rounded-lg object-contain" /></a>}
    </div>
  );
};

const CommiteeAssignmentViewDocuments: React.FC<Props> = ({
  assignment,
  formatFileSize,
  formatDate,
  apiBaseUrl,
  t,
}) => {
  const request = assignment.certificationRequest;
  const isMedia = (attachment: any) => ["audio", "video"].includes(mediaKind(attachment));
  const requestAttachments = (request?.attachments || []).filter((attachment) => !isMedia(attachment));
  const companyAttachments = (request?.company?.attachments || []).filter((attachment) => !isMedia(attachment));
  const payments = request?.payments || [];
  const allAttachments = [...(request?.attachments || []), ...(request?.company?.attachments || [])];
  const mediaAttachments = allAttachments.filter(isMedia);
  const renderAttachments = (attachments: any[]) => attachments.length > 0 ? <div className="space-y-3">{attachments.map((attachment) => <AttachmentCard key={attachment.id} attachment={attachment} apiBaseUrl={apiBaseUrl} formatFileSize={formatFileSize} t={t} />)}</div> : <p className="py-6 text-center text-sm text-gray-500">{t("common.noDocuments")}</p>;

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
                className="flex min-w-0 items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3 flex-1">
                  <File className="h-5 w-5 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p dir="auto" className="font-medium text-gray-900 whitespace-normal [overflow-wrap:anywhere]" title={attachment.attachmentName}>
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
                className="flex min-w-0 items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3 flex-1">
                  <File className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="min-w-0">
                    <p dir="auto" className="font-medium text-gray-900 whitespace-normal [overflow-wrap:anywhere]" title={attachment.attachmentName}>
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
      {mediaAttachments.length > 0 && <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-blue-600" />
          {t("commitee.assignment.mediaFiles", { defaultValue: "Video and audio" })} ({mediaAttachments.length})
        </h3>
        {renderAttachments(mediaAttachments)}
      </div>}
    </div>
  );
};

export default CommiteeAssignmentViewDocuments;
