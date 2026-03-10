import React, { useRef, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import type { FileUploadSelectEvent, FileUploadHeaderTemplateOptions, ItemTemplateOptions } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Tooltip } from "primereact/tooltip";

interface FileUploadFieldProps {
  label?: string;
  name?: string;
  maxFileSize?: number;
  accept?: string;
  onFileSelect?: (file: File | null) => void;
  required?: boolean;
  helperText?: string;
  className?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label = "",
  name = "file",
  maxFileSize = 1048576, // 1MB default
  accept = "image/*",
  onFileSelect,
  required = false,
  helperText,
  className = "",
}) => {
  const fileUploadRef = useRef<FileUpload | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* ================= SELECT ================= */
  const handleSelect = (event: FileUploadSelectEvent) => {
    if (!event.files || event.files.length === 0) return;

    const file = event.files[0] as File;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setTotalSize(file.size);

    onFileSelect?.(file);
  };

  /* ================= REMOVE ================= */
  const handleRemove = (file: File, callback: () => void) => {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setTotalSize(0);
    onFileSelect?.(null);
    callback();
  };

  /* ================= CLEAR ================= */
  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setTotalSize(0);
    onFileSelect?.(null);
  };

  /* ================= FORMAT SIZE ================= */
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /* ================= HEADER TEMPLATE ================= */
  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { className, chooseButton, cancelButton } = options;

    const progressValue = (totalSize / maxFileSize) * 100;
    const formattedValue = formatSize(totalSize);
    const maxFormatted = formatSize(maxFileSize);

    return (
      <div
        className={`${className} flex flex-wrap align-items-center gap-3 p-3`}
        style={{
          backgroundColor: "var(--surface-50)",
          borderBottom: "1px solid var(--surface-200)",
        }}
      >
        <div className="flex align-items-center gap-2">
          {chooseButton}
          {cancelButton}
        </div>
        
        <div className="flex align-items-center gap-3 ml-auto">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-database text-primary"></i>
            <span className="text-sm font-medium">
              {formattedValue} / {maxFormatted}
            </span>
          </div>
          
          {totalSize > 0 && (
            <ProgressBar 
              value={progressValue} 
              showValue={false} 
              style={{ width: '8rem', height: '8px' }} 
              className="border-round"
              color={progressValue > 90 ? 'var(--red-500)' : 'var(--primary-500)'}
            />
          )}
        </div>
      </div>
    );
  };

  /* ================= ITEM TEMPLATE ================= */
  const itemTemplate = (file: any, props: ItemTemplateOptions) => {
    return (
      <div className="flex align-items-center justify-content-between w-full p-3 surface-card border-round shadow-1">
        <div className="flex align-items-center gap-4">
          {/* Preview Image */}
          <div className="relative">
            <img
              alt={file.name}
              role="presentation"
              src={file.objectURL || previewUrl}
              width={80}
              height={80}
              className="border-round shadow-1 object-cover"
              style={{ objectFit: 'cover' }}
            />
            <div className="absolute top-0 right-0">
              <Tag 
                value="New" 
                severity="success" 
                rounded 
                className="text-xs"
                style={{ transform: 'translate(50%, -50%)' }}
              />
            </div>
          </div>

          {/* File Details */}
          <div className="flex flex-column gap-1">
            <div className="font-semibold text-base">{file.name}</div>
            <div className="flex align-items-center gap-3 text-sm text-gray-500">
              <span className="flex align-items-center gap-1">
                <i className="pi pi-calendar"></i>
                {new Date().toLocaleDateString()}
              </span>
              <span className="flex align-items-center gap-1">
                <i className="pi pi-file"></i>
                {props.formatSize}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            icon="pi pi-download"
            className="p-button-rounded p-button-text p-button-sm"
            tooltip="Download"
            tooltipOptions={{ position: 'top' }}
            onClick={() => {
              // Download functionality
              const link = document.createElement('a');
              link.href = file.objectURL || previewUrl || '';
              link.download = file.name;
              link.click();
            }}
          />
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-rounded p-button-text p-button-danger p-button-sm"
            tooltip="Remove"
            tooltipOptions={{ position: 'top' }}
            onClick={(event) => handleRemove(file, () => props.onRemove(event))}
          />
        </div>
      </div>
    );
  };

  /* ================= EMPTY TEMPLATE ================= */
  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column p-3 surface-50 border-round">
        <div className="relative mb-3">
          <i
            className="pi pi-cloud-upload p-4"
            style={{
              fontSize: "4rem",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%)",
              color: "var(--primary-600)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          ></i>
          <div className="absolute" style={{ bottom: '0', right: '0' }}>
            <Tag value="Max 1MB" severity="info" rounded />
          </div>
        </div>
        
        <span className="text-xl font-medium text-gray-700 mb-2">
          Drag & Drop Your File Here
        </span>
        
        <span className="text-sm text-gray-500 mb-4 text-center">
          Supported formats: {accept.split(',').join(', ')}
        </span>
        
        <div className="flex align-items-center gap-2 mt-2">
          <i className="pi pi-check-circle text-green-500"></i>
          <span className="text-xs text-gray-500">Securely uploaded</span>
        </div>
      </div>
    );
  };

  /* ================= CHOOSE BUTTON CUSTOMIZATION ================= */
  const chooseOptions = {
    icon: "pi pi-fw pi-plus",
    iconOnly: true,
    className: "custom-choose-btn p-button-rounded p-button-outlined p-button-primary",
    style: { width: '40px', height: '40px' }
  };

  const cancelOptions = {
    icon: "pi pi-fw pi-trash",
    iconOnly: true,
    className: "custom-cancel-btn p-button-rounded p-button-outlined p-button-danger",
    style: { width: '40px', height: '40px' }
  };

  return (
    <div className={`file-upload-field ${className}`}>
      {/* Tooltips */}
      <Tooltip target=".custom-choose-btn" content="Choose File" position="bottom" />
      <Tooltip target=".custom-cancel-btn" content="Clear All" position="bottom" />

      {/* Label */}
      {(label || required) && (
        <div className="flex align-items-center gap-2 mb-2">
          <label className="font-semibold text-gray-700">{label}</label>
          {required && <Tag value="Required" severity="danger" rounded className="text-xs" />}
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <div className="mb-2 text-xs text-gray-500 flex align-items-center gap-1">
          <i className="pi pi-info-circle"></i>
          <span>{helperText}</span>
        </div>
      )}

      {/* File Upload Component */}
 <FileUpload
  ref={fileUploadRef}
  name={name}
  accept={accept}
  maxFileSize={maxFileSize}
  multiple={false}
  customUpload
  auto={false}
  onSelect={handleSelect}
  onClear={handleClear}
  headerTemplate={headerTemplate}
  itemTemplate={itemTemplate}
  emptyTemplate={emptyTemplate}
  chooseOptions={chooseOptions}
  cancelOptions={cancelOptions}
  className="border-round shadow-1"
  style={{ border: '1px solid var(--surface-200)' }}
  pt={{
    content: { style: { padding: '0.5rem' } }
  }}
/>

      {/* Additional Info */}
      {selectedFile && (
        <div className="mt-2 flex align-items-center gap-2 text-xs">
          <i className="pi pi-check-circle text-green-500"></i>
          <span className="text-green-600">File ready for upload</span>
          <span className="text-gray-400 mx-1">•</span>
          <span className="text-gray-500">Type: {selectedFile.type}</span>
          <span className="text-gray-400 mx-1">•</span>
          <span className="text-gray-500">Size: {formatSize(selectedFile.size)}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploadField;