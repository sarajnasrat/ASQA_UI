import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CertificationRequestService from "../../../services/CertificationReques.service";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  File,
  FileImage,
  FileText as FilePdf,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  Loader2,
  Inbox,
} from "lucide-react";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

interface Attachment {
  id: number;
  attachmentName?: string;
  file: string;
  fileType?: string;
  fileSize?: number;
}

interface StatusHistory {
  id: number;
  status: string;
  changedAt: string;
  changedBy?: string;
  comments?: string;
  attachments?: Attachment[];
}

type StatusConfigItem = {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

type StatusConfig = Record<string, StatusConfigItem>;

const BASE_URL = "http://localhost:8080";

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const downloadAttachment = async (attachment: Attachment) => {
  try {
    let fileUrl = attachment.file;

    if (!fileUrl.startsWith("http")) {
      fileUrl = `${BASE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
    }

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      attachment.attachmentName || attachment.file.split("/").pop() || "file";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    alert("Unable to download file.");
  }
};

const useStatusConfig = (): StatusConfig => {
  const { t } = useTranslation();

  return {
    SUBMITTED: {
      label: t("certificationRequest.statusOptions.SUBMITTED"),
      icon: <Clock size={14} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    STANDARDS_PROVIDED: {
      label: t("certificationRequest.statusOptions.STANDARDS_PROVIDED"),
      icon: <FileText size={14} />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    PAYMENT_PENDING: {
      label: t("certificationRequest.statusOptions.PAYMENT_PENDING"),
      icon: <AlertCircle size={14} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    CERTIFICATE_ISSUED: {
      label: t("certificationRequest.statusOptions.CERTIFICATE_ISSUED"),
      icon: <CheckCircle2 size={14} />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    REJECTED: {
      label: t("certificationRequest.statusOptions.REJECTED"),
      icon: <XCircle size={14} />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    UNDER_REVIEW: {
      label: t("certificationRequest.statusOptions.UNDER_REVIEW"),
      icon: <Clock size={14} />,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    REGISTERED: {
      label: t("certificationRequest.statusOptions.REGISTERED"),
      icon: <CheckCircle2 size={14} />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    DEADLINE_ASSIGNED: {
      label: t("certificationRequest.statusOptions.DEADLINE_ASSIGNED"),
      icon: <AlertCircle size={14} />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    INSPECTION_IN_PROGRESS: {
      label: t("certificationRequest.statusOptions.INSPECTION_IN_PROGRESS"),
      icon: <Clock size={14} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    REPORTED_TO_COMMITTEE: {
      label: t("certificationRequest.statusOptions.REPORTED_TO_COMMITTEE"),
      icon: <FileText size={14} />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    REPORT_APPROVED: {
      label: t("certificationRequest.statusOptions.REPORT_APPROVED"),
      icon: <CheckCircle2 size={14} />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    PAYMENT_COMPLETED: {
      label: t("certificationRequest.statusOptions.PAYMENT_COMPLETED"),
      icon: <CheckCircle2 size={14} />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    UNDER_SUPERVISION: {
      label: t("certificationRequest.statusOptions.UNDER_SUPERVISION"),
      icon: <Clock size={14} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    CANCELLED: {
      label: t("certificationRequest.statusOptions.CANCELLED"),
      icon: <XCircle size={14} />,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    DRAFT: {
      label: t("certificationRequest.statusOptions.DRAFT"),
      icon: <FileText size={14} />,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    DEADLINE_REQUIRED: {
      label: t("certificationRequest.statusOptions.DEADLINE_REQUIRED"),
      icon: <AlertCircle size={14} />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  };
};

const AttachmentCard = ({ file }: { file: Attachment }) => {
  const { t } = useTranslation();

  const getFileType = (fileType?: string): string => {
    if (!fileType) return t("certification.fileTypes.file");
    if (fileType.startsWith("image/")) return t("attachment.type.IMAGE");
    if (fileType === "application/pdf") return "PDF";
    if (fileType.includes("word") || fileType.includes("document"))
      return t("fileUpload.word");
    if (fileType.includes("sheet") || fileType.includes("excel"))
      return t("fileUpload.excel");
    if (
      fileType.includes("zip") ||
      fileType.includes("rar") ||
      fileType.includes("archive")
    )
      return t("certification.fileTypes.archive");
    if (fileType.startsWith("text/")) return t("certification.fileTypes.text");

    return t("certification.fileTypes.file");
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="text-purple-600" size={20} />;
    if (fileType.startsWith("image/"))
      return <FileImage className="text-blue-500" size={20} />;
    if (fileType === "application/pdf")
      return <FilePdf className="text-red-500" size={20} />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <FileText className="text-blue-600" size={20} />;
    if (fileType.includes("sheet") || fileType.includes("excel"))
      return <FileSpreadsheet className="text-green-600" size={20} />;
    if (
      fileType.includes("zip") ||
      fileType.includes("rar") ||
      fileType.includes("archive")
    )
      return <FileArchive className="text-yellow-600" size={20} />;
    if (fileType.startsWith("text/"))
      return <FileCode className="text-gray-600" size={20} />;

    return <File className="text-purple-600" size={20} />;
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-200 transition-all duration-200 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="relative p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="shrink-0 p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
            {getFileIcon(file.fileType)}
          </div>

          <div className="flex-1 min-w-0 text-start">
            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-700 transition-colors">
              {file.attachmentName || file.file.split("/").pop() || t("attachment.unknown_file")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-3 border-t border-gray-100 group-hover:border-purple-100 transition-colors">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
              {getFileType(file.fileType)}
            </span>

            <span className="text-gray-300">•</span>

            <span className="text-gray-500">{formatFileSize(file.fileSize)}</span>
          </div>

          <button
            type="button"
            onClick={() => downloadAttachment(file)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 text-xs font-medium"
            title={t("attachment.download")}
          >
            <Download size={14} />
            <span>{t("attachment.download")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({
  item,
  isLatest,
  step,
  total,
}: {
  item: StatusHistory;
  isLatest: boolean;
  step: number;
  total: number;
}) => {
  const { t } = useTranslation();
  const statusConfig = useStatusConfig();

  const config: StatusConfigItem = statusConfig[item.status] ?? {
    label: item.status,
    icon: <FileText size={14} />,
    color: "text-gray-600",
    bg: "bg-gray-50",
  };

  return (
    <li className="mb-10 ms-6">
      <span
        className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ring-8 ring-white ${config.bg}`}
      >
        <span className={config.color}>{config.icon}</span>
      </span>

      <time className="text-xs text-gray-500">
        {IslamicDateFormatter.formatQamari(item.changedAt, true)}
      </time>

      <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold mt-1 text-gray-900">
        {config.label}

        {isLatest && (
          <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded">
            {t("certification.latest")}
          </span>
        )}
      </h3>

      {item.changedBy && (
        <p className="text-sm text-gray-600 mt-1">
          {t("certification.updatedBy")} <strong>{item.changedBy}</strong>
        </p>
      )}

      {item.comments && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          {item.comments}
        </div>
      )}

      {item.attachments && item.attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {item.attachments.map((attachment) => (
            <AttachmentCard key={attachment.id} file={attachment} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        {t("certification.stepProgress", { step, total })}
      </p>
    </li>
  );
};

export default function CertificationRequestTracker({
  requestId,
}: {
  requestId: string;
}) {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await CertificationRequestService.getRequestTracker(requestId);

        setHistory(response.data || []);
      } catch {
        setError(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [requestId, t]);

  if (loading) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center py-20 text-gray-500 text-center"
      >
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
        <p className="text-lg">{t("common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>

        <p className="text-lg text-red-600 font-medium">{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          {t("certification.tryAgain")}
        </button>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="bg-gray-50 rounded-full p-4 mb-4">
          <Inbox className="h-10 w-10 text-gray-400" />
        </div>

        <p className="text-lg text-gray-400">{t("certification.noUpdates")}</p>

        <p className="text-sm text-gray-400 mt-2">
          {t("certification.noUpdatesMessage")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {t("certification.progressTitle")}
        </h2>

        <p className="text-gray-600">
          {t("certification.progressDescription")}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700 font-medium">
            {t("certification.requestId")}:
          </span>

          <span className="text-sm font-mono text-blue-600">{requestId}</span>
        </div>
      </div>

      <ol className="relative border-s border-gray-200 ms-3">
        {history.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLatest={index === history.length - 1}
            step={index + 1}
            total={history.length}
          />
        ))}
      </ol>
    </div>
  );
}
