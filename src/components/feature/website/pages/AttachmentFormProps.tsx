// components/feature/registration/AttachmentForm.tsx
import React, { useEffect, useState } from "react";
import { FileText, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { useAppToast } from "../../../../hooks/useToast";
import AttachmentService from "../../../../services/attachment.service";
import { handleApi } from "../../../../hooks/handleApi";
import { useToast } from "../../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";

interface AttachmentFormProps {
  companyId: number;
  onSuccess: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const AttachmentForm: React.FC<AttachmentFormProps> = ({
  companyId,
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}) => {
  const { showToast } = useAppToast();
  const { showError, showSuccess } = useToast();

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const [attachmentId, setAttachmentId] = useState<number | null>(null);
  const { t } = useTranslation();
  const storageKey = `company_${companyId}_attachment_id`;

  const acceptedFileTypes = ["application/pdf"];
  const maxFileSize = 10 * 1024 * 1024;

  const getAttachmentById = async (id: number) => {
    try {
      const response = await AttachmentService.getById(id);

      const attachmentData = response?.data?.data || response?.data;

      if (attachmentData) {
        setAttachment(attachmentData);
        setAttachmentId(id);
        return attachmentData;
      }

      return null;
    } catch (error) {
      console.error("Error fetching attachment:", error);
      localStorage.removeItem(storageKey);
      setAttachment(null);
      setAttachmentId(null);
      return null;
    }
  };

  useEffect(() => {
    if (!companyId) return;

    const storedId = localStorage.getItem(storageKey);

    if (storedId) {
      const id = Number(storedId);

      if (!isNaN(id)) {
        getAttachmentById(id);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [companyId]);

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return t("attachment.validation.file_type");
    }

    if (file.size > maxFileSize) {
      return t("attachment.validation.file_size");
    }

    return null;
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles: UploadedFile[] = [];

    newFiles.forEach((file) => {
      const error = validateFile(file);

      if (error) {
        showToast("error", t("attachment.error"), error);
      } else {
        validFiles.push({
          file,
          progress: 0,
          status: "pending",
        });
      }
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 && attachment) {
      onSuccess();
      return;
    }

    if (files.length === 0) {
      showToast("error", t("attachment.error"), t("attachment.please_select_file"));
      return;
    }

    setIsSubmitting(true);

    const fileItem = files[0];

    setFiles((prev) =>
      prev.map((f, idx) =>
        idx === 0 ? { ...f, status: "uploading", progress: 30 } : f,
      ),
    );

    const storedId = localStorage.getItem(storageKey);
    let response;

    if (storedId) {
      const id = Number(storedId);

      response = await handleApi(
        () =>
          AttachmentService.update(
            id,
            fileItem.file,
            fileItem.file.name,
            companyId,
          ),
        showSuccess,
        showError,
      );

      if (response) {
        setAttachmentId(id);
        await getAttachmentById(id);
      }
    } else {
      response = await handleApi(
        () =>
          AttachmentService.create(
            fileItem.file,
            fileItem.file.name,
            companyId,
            "COMPANY",
          ),
        showSuccess,
        showError,
      );

      const createdId = response?.data?.id || response?.data?.data?.id;

      if (createdId) {
        localStorage.setItem(storageKey, String(createdId));
        setAttachmentId(Number(createdId));
        await getAttachmentById(Number(createdId));
      }
    }

    if (!response) {
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === 0
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: t("attachment.failed_to_upload_attachment"),
              }
            : f,
        ),
      );

      setIsSubmitting(false);
      return;
    }

    setFiles((prev) =>
      prev.map((f, idx) =>
        idx === 0 ? { ...f, status: "success", progress: 100 } : f,
      ),
    );

    setTimeout(() => {
      setFiles([]);
    }, 500);

    setIsSubmitting(false);
    onSuccess();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="h-10 w-10 object-cover rounded"
        />
      );
    }

    return <FileText className="h-10 w-10 text-blue-600" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "uploading":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <FileText className="h-6 w-6 text-blue-600 mr-2" />
        {t("attachment.management_title")}
      </h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {t("attachment.required_documents_title")}
        </h3>

        <div className="space-y-3">
          <p className="font-medium text-gray-800">
            {t("attachment.combine_documents_message")}
          </p>
          <p className="text-sm text-gray-600">
            {t("attachment.combine_documents_description")}
          </p>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />

        <p className="text-gray-600 mb-2">
          {t("attachment.drag_drop_message")}
        </p>

        <p className="text-sm text-gray-500 mb-4">
          {t("attachment.supported_formats_simple")}
        </p>

        <input
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".pdf"
        />

        <label
          htmlFor="file-upload"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t("attachment.browse_files")}
        </label>
      </div>

      {(attachment || files.length > 0) && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            {files.length > 0 ? t("attachment.selected_file") : t("attachment.saved_file")}
          </h3>

          <div className="space-y-3">
            {attachment && files.length === 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="h-10 w-10 text-blue-600" />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {attachment.attachmentName}
                      </span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>

                    <div className="text-xs text-gray-500">
                      {attachment.fileSize
                        ? `${(attachment.fileSize / 1024 / 1024).toFixed(2)} MB`
                        : t("attachment.saved_attachment")}
                    </div>

                    <p className="text-xs text-green-600 mt-1">
                      ✓ {t("attachment.previous_document_loaded")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  file.status === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(file.file)}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {file.file.name}
                      </span>
                      {getStatusIcon(file.status)}
                    </div>

                    <div className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    {file.status === "uploading" && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {file.progress}%
                        </span>
                      </div>
                    )}

                    {file.status === "success" && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {t("attachment.document_saved_successfully")}
                      </p>
                    )}

                    {file.status === "error" && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>

                {file.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          {t("common.back")}
        </button>

        <button
          type="submit"
          disabled={isSubmitting || (!attachment && files.length === 0)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("common.saving")}
            </>
          ) : files.length > 0 && attachmentId ? (
            t("attachment.update_attachment")
          ) : attachment ? (
            t("common.saveAndContinue")
          ) : (
            t("common.saveAndContinue")
          )}
        </button>
      </div>
    </form>
  );
};

export default AttachmentForm;