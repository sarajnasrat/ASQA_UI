import React, { useEffect, useState } from "react";
import CertificationRequestService from "../../../services/CertificationReques.service";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";

/* =====================================================
   TYPES
===================================================== */

interface Attachment {
  id: number;
  attachmentName: string;
  file: string;
  fileType: string;
  fileSize: number;
}

interface StatusHistory {
  id: number;
  status: string;
  changedAt: string;
  changedBy?: string;
  comments?: string;
  attachments?: Attachment[];
}

/* =====================================================
   STATUS CONFIG (User Friendly)
===================================================== */

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }
> = {
  SUBMITTED: {
    label: "Application Submitted",
    icon: <Clock size={14} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },

  STANDARDS_PROVIDED: {
    label: "Standards Provided",
    icon: <FileText size={14} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },

  PAYMENT_PENDING: {
    label: "Payment Required",
    icon: <AlertCircle size={14} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },

  CERTIFICATE_ISSUED: {
    label: "Certificate Issued",
    icon: <CheckCircle2 size={14} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },

  REJECTED: {
    label: "Request Rejected",
    icon: <XCircle size={14} />,
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

/* =====================================================
   HELPERS
===================================================== */

const BASE_URL = "http://localhost:8080";

const formatFileSize = (bytes: number) => {
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

    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      attachment.attachmentName ||
      attachment.file.split("/").pop() ||
      "file";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert("Unable to download file.");
  }
};

/* =====================================================
   ATTACHMENT CARD
===================================================== */

const AttachmentCard = ({ file }: { file: Attachment }) => {
  // Helper function to get clean file type
  const getFileType = (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'IMAGE';
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'DOCUMENT';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'SPREADSHEET';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return 'ARCHIVE';
    if (fileType.startsWith('text/')) return 'TEXT';
    return 'FILE';
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileText className="text-blue-500" size={20} />;
    if (fileType === 'application/pdf') return <FileText className="text-red-500" size={20} />;
    if (fileType.includes('word')) return <FileText className="text-blue-600" size={20} />;
    if (fileType.includes('excel')) return <FileText className="text-green-600" size={20} />;
    return <FileText className="text-purple-600" size={20} />;
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-200 transition-all duration-200 overflow-hidden">
      {/* Gradient Hover Effect */}
      <div className="absolute inset-0 bg-linear-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      
      <div className="relative p-3">
        <div className="flex items-center gap-2 mb-2">
          {/* File Icon */}
          <div className="flex-shrink-0 p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
            {getFileIcon(file.fileType)}
          </div>
          
          {/* File Name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-700 transition-colors">
              {file.attachmentName || file.file.split("/").pop()}
            </p>
          </div>
        </div>

        {/* File Info Row - Type, Size, and Download Button */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 group-hover:border-purple-100 transition-colors">
          <div className="flex items-center gap-2 text-xs">
            {/* File Type Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
              {getFileType(file.fileType)}
            </span>
            
            {/* Separator */}
            <span className="text-gray-300">•</span>
            
            {/* File Size */}
            <span className="text-gray-500">
              {formatFileSize(file.fileSize)}
            </span>
          </div>
          
          {/* Download Button - Now placed with file type and size */}
          <button
            onClick={() => downloadAttachment(file)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 text-xs font-medium"
            title="Download"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   TIMELINE ITEM
===================================================== */

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
  const config =
    STATUS_CONFIG[item.status] || {
      label: item.status,
      icon: <FileText size={14} />,
      color: "text-gray-600",
      bg: "bg-gray-50",
    };

  return (
    <li className="mb-10 ms-6">
      {/* ICON */}
      <span
        className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ring-8 ring-white ${config.bg}`}
      >
        <span className={config.color}>{config.icon}</span>
      </span>

      {/* DATE */}
      <time className="text-xs text-gray-500">
        {new Date(item.changedAt).toLocaleString()}
      </time>

      {/* TITLE */}
      <h3 className="flex items-center gap-2 text-lg font-semibold mt-1">
        {config.label}
        {isLatest && (
          <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded">
            Latest
          </span>
        )}
      </h3>

      {/* USER */}
      {item.changedBy && (
        <p className="text-sm text-gray-600">
          Updated by <strong>{item.changedBy}</strong>
        </p>
      )}

      {/* COMMENTS */}
      {item.comments && (
        <div className="mt-2 bg-gray-50 border rounded p-3 text-sm">
          {item.comments}
        </div>
      )}

      {/* ATTACHMENTS */}
      {item.attachments?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {item.attachments.map((a) => (
            <AttachmentCard key={a.id} file={a} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Step {step} of {total}
      </p>
    </li>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function CertificationRequestTracker({
  requestId,
}: {
  requestId: string;
}) {
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await CertificationRequestService.getRequestTracker(requestId);
        setHistory(data.data || []);
      } catch {
        setError("Unable to load request history.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [requestId]);

  /* ===================== STATES ===================== */

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading request timeline...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-red-600">{error}</div>
    );

  if (!history.length)
    return (
      <div className="text-center py-12 text-gray-400">
        No updates yet.
      </div>
    );

  /* ===================== UI ===================== */

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-2">
        Certification Request Progress
      </h2>
      <p className="text-gray-600 mb-8">
        Follow each step of your certification process.
      </p>

      <ol className="relative border-s border-gray-200">
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