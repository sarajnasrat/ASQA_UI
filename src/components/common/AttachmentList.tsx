import React from "react";
import { Download, Eye, Paperclip } from "lucide-react";

interface Attachment {
  id: string | number;
  attachmentName: string;
  filePath?: string;
  file?: string;
  fileSize?: string | number;
  fileType?: string;
  createdAt?: string;
}

interface AttachmentListProps {
  attachments?: any[];
  emptyMessage?: string;
  showIcons?: boolean;
  showSize?: boolean;
  variant?: "default" | "compact" | "detailed";
  onDownload?: (attachment: Attachment) => void;
  onPreview?: (attachment: Attachment) => void;
  className?: string;
}

// Helper function to get file icon
const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  
  const icons: Record<string, string> = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    zip: "📦",
    rar: "📦",
    mp4: "🎥",
    mp3: "🎵",
  };
  
  return icons[extension || ""] || "📎";
};

// Get file extension
const getFileExtension = (fileName: string) => {
  const ext = fileName.split(".").pop();
  return ext || "unknown";
};

// Format file size
const formatFileSize = (bytes?: string | number) => {
  if (!bytes) return "0 B";
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (isNaN(size)) return "0 B";
  
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments = [],
  emptyMessage = "No attachments",
  showIcons = true,
  showSize = true,
  variant = "default",
  onDownload,
  onPreview,
  className = "",
}) => {
  if (!attachments.length) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Paperclip className="w-3.5 h-3.5" />
        <span className="text-xs">{emptyMessage}</span>
      </div>
    );
  }

  // Different styles based on variant
  const variants = {
    default: "space-y-2",
    compact: "space-y-1.5",
    detailed: "space-y-2",
  };

  const itemVariants = {
    default: "p-2 hover:bg-gray-50 rounded-lg transition-all duration-200",
    compact: "p-1 hover:bg-gray-50 rounded transition-all duration-200",
    detailed: "p-2 hover:bg-gray-50 rounded-lg transition-all duration-200",
  };

  // For table compact view
  if (variant === "compact") {
    return (
      <div className={`${variants[variant]} ${className}`}>
        {attachments.map((file) => (
          <div key={file.id} className={`group ${itemVariants[variant]}`}>
            <div className="flex items-center gap-2">
              {/* File Icon */}
              {showIcons && (
                <span className="text-base shrink-0">
                  {getFileIcon(file.attachmentName)}
                </span>
              )}
              
              {/* File Name */}
              <span className="text-xs text-gray-700 truncate flex-1">
                {file.attachmentName}
              </span>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {(onPreview || file.filePath || file.file) && (
                  <button
                    onClick={() => {
                      if (onPreview) {
                        onPreview(file);
                      } else {
                        window.open(file.filePath || file.file, '_blank');
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                )}
                
                {onDownload && (
                  <button
                    onClick={() => onDownload(file)}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Show size in compact mode on second line if needed */}
            {showSize && file.fileSize && (
              <div className="text-xs text-gray-400 pl-6">
                {formatFileSize(file.fileSize)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default and detailed variants
  return (
    <div className={`${variants[variant]} ${className}`}>
      {attachments.map((file) => (
        <div key={file.id} className={`group ${itemVariants[variant]}`}>
          <div className="flex gap-2">
            {/* File Icon */}
            {showIcons && (
              <div className="shrink-0">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{getFileIcon(file.attachmentName)}</span>
                </div>
              </div>
            )}

            {/* File Details */}
            <div className="flex-1 min-w-0">
              {/* File Name Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800 truncate block">
                    {file.attachmentName}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {(onPreview || file.filePath || file.file) && (
                    <button
                      onClick={() => {
                        if (onPreview) {
                          onPreview(file);
                        } else {
                          window.open(file.filePath || file.file, '_blank');
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  {onDownload && (
                    <button
                      onClick={() => onDownload(file)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap mt-0.5">
                <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {getFileExtension(file.attachmentName).toUpperCase()}
                </span>
                
                {showSize && file.fileSize && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 text-xs">
                      {formatFileSize(file.fileSize)}
                    </span>
                  </>
                )}
                
                {variant === "detailed" && file.createdAt && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};