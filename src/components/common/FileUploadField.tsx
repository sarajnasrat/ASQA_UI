// import React, { useRef, useState } from "react";
// import { FileUpload } from "primereact/fileupload";
// import type { FileUploadSelectEvent, FileUploadHeaderTemplateOptions, ItemTemplateOptions } from "primereact/fileupload";
// import { Button } from "primereact/button";
// import { Tag } from "primereact/tag";
// import { ProgressBar } from "primereact/progressbar";
// import { Tooltip } from "primereact/tooltip";

// interface FileUploadFieldProps {
//   label?: string;
//   name?: string;
//   maxFileSize?: number;
//   accept?: string;
//   onFileSelect?: (file: File | null) => void;
//   required?: boolean;
//   helperText?: string;
//   className?: string;
// }

// const FileUploadField: React.FC<FileUploadFieldProps> = ({
//   label = "",
//   name = "file",
//   maxFileSize = 1048576, // 1MB default
//   accept = "image/*",
//   onFileSelect,
//   required = false,
//   helperText,
//   className = "",
// }) => {
//   const fileUploadRef = useRef<FileUpload | null>(null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [totalSize, setTotalSize] = useState<number>(0);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   /* ================= SELECT ================= */
//   const handleSelect = (event: FileUploadSelectEvent) => {
//     if (!event.files || event.files.length === 0) return;

//     const file = event.files[0] as File;

//     // Create preview URL
//     const url = URL.createObjectURL(file);
//     setPreviewUrl(url);
//     setSelectedFile(file);
//     setTotalSize(file.size);

//     onFileSelect?.(file);
//   };

//   /* ================= REMOVE ================= */
//   const handleRemove = (file: File, callback: () => void) => {
//     // Clean up preview URL
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }
    
//     setSelectedFile(null);
//     setPreviewUrl(null);
//     setTotalSize(0);
//     onFileSelect?.(null);
//     callback();
//   };

//   /* ================= CLEAR ================= */
//   const handleClear = () => {
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }
    
//     setSelectedFile(null);
//     setPreviewUrl(null);
//     setTotalSize(0);
//     onFileSelect?.(null);
//   };

//   /* ================= FORMAT SIZE ================= */
//   const formatSize = (bytes: number): string => {
//     if (bytes === 0) return '0 B';
//     const k = 1024;
//     const sizes = ['B', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   /* ================= HEADER TEMPLATE ================= */
//   const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
//     const { className, chooseButton, cancelButton } = options;

//     const progressValue = (totalSize / maxFileSize) * 100;
//     const formattedValue = formatSize(totalSize);
//     const maxFormatted = formatSize(maxFileSize);

//     return (
//       <div
//         className={`${className} flex flex-wrap align-items-center gap-3 p-3`}
//         style={{
//           backgroundColor: "var(--surface-50)",
//           borderBottom: "1px solid var(--surface-200)",
//         }}
//       >
//         <div className="flex align-items-center gap-2">
//           {chooseButton}
//           {cancelButton}
//         </div>
        
//         <div className="flex align-items-center gap-3 ml-auto">
//           <div className="flex align-items-center gap-2">
//             <i className="pi pi-database text-primary"></i>
//             <span className="text-sm font-medium">
//               {formattedValue} / {maxFormatted}
//             </span>
//           </div>
          
//           {totalSize > 0 && (
//             <ProgressBar 
//               value={progressValue} 
//               showValue={false} 
//               style={{ width: '8rem', height: '8px' }} 
//               className="border-round"
//               color={progressValue > 90 ? 'var(--red-500)' : 'var(--primary-500)'}
//             />
//           )}
//         </div>
//       </div>
//     );
//   };

//   /* ================= ITEM TEMPLATE ================= */
//   const itemTemplate = (file: any, props: ItemTemplateOptions) => {
//     return (
//       <div className="flex align-items-center justify-content-between w-full p-3 surface-card border-round shadow-1">
//         <div className="flex align-items-center gap-4">
//           {/* Preview Image */}
//           <div className="relative">
//             <img
//               alt={file.name}
//               role="presentation"
//               src={file.objectURL || previewUrl}
//               width={80}
//               height={80}
//               className="border-round shadow-1 object-cover"
//               style={{ objectFit: 'cover' }}
//             />
//             {/* <div className="absolute top-0 right-0">
//               <Tag 
//                 value="New" 
//                 severity="success" 
//                 rounded 
//                 className="text-xs"
//                 style={{ transform: 'translate(50%, -50%)' }}
//               />
//             </div> */}
//           </div>

//           {/* File Details */}
//           <div className="flex flex-column gap-1">
//             <div className="font-semibold text-base">{file.name}</div>
//             {/* <div className="flex align-items-center gap-3 text-sm text-gray-500">
//               <span className="flex align-items-center gap-1">
//                 <i className="pi pi-calendar"></i>
//                 {new Date().toLocaleDateString()}
//               </span>
//               <span className="flex align-items-center gap-1">
//                 <i className="pi pi-file"></i>
//                 {props.formatSize}
//               </span>
//             </div> */}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex align-items-center gap-2">
//           {/* <Button
//             type="button"
//             icon="pi pi-download"
//             className="p-button-rounded p-button-text p-button-sm"
//             tooltip="Download"
//             tooltipOptions={{ position: 'top' }}
//             onClick={() => {
//               // Download functionality
//               const link = document.createElement('a');
//               link.href = file.objectURL || previewUrl || '';
//               link.download = file.name;
//               link.click();
//             }}
//           /> */}
//           {/* <Button
//             type="button"
//             icon="pi pi-times"
//             className="p-button-rounded p-button-text p-button-danger p-button-sm"
//             tooltip="Remove"
//             tooltipOptions={{ position: 'top' }}
//             onClick={(event) => handleRemove(file, () => props.onRemove(event))}
//           /> */}
//         </div>
//       </div>
//     );
//   };

//   /* ================= EMPTY TEMPLATE ================= */
//   const emptyTemplate = () => {
//     return (
//       <div className="flex align-items-center flex-column p-3 surface-50 border-round">
//         <div className="relative mb-3">
//           <i
//             className="pi pi-cloud-upload p-4"
//             style={{
//               fontSize: "4rem",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%)",
//               color: "var(--primary-600)",
//               boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
//             }}
//           ></i>
//           <div className="absolute" style={{ bottom: '0', right: '0' }}>
//             <Tag value="Max 1MB" severity="info" rounded />
//           </div>
//         </div>
        
//         {/* <span className="text-xl font-medium text-gray-700 mb-2">
//           Drag & Drop Your File Here
//         </span>
        
//         <span className="text-sm text-gray-500 mb-4 text-center">
//           Supported formats: {accept.split(',').join(', ')}
//         </span>
        
//         <div className="flex align-items-center gap-2 mt-2">
//           <i className="pi pi-check-circle text-green-500"></i>
//           <span className="text-xs text-gray-500">Securely uploaded</span>
//         </div> */}
//       </div>
//     );
//   };

//   /* ================= CHOOSE BUTTON CUSTOMIZATION ================= */
//   const chooseOptions = {
//     icon: "pi pi-fw pi-plus",
//     iconOnly: true,
//     className: "custom-choose-btn p-button-rounded p-button-outlined p-button-primary",
//     style: { width: '40px', height: '40px' ,"justify-content": "end" }
//   };

//   const cancelOptions = {
//     icon: "pi pi-fw pi-trash",
//     iconOnly: true,
//     className: "custom-cancel-btn p-button-rounded p-button-outlined p-button-danger",
//     style: { width: '40px', height: '40px' ,"justify-content": "end" }
//   };

//   return (
//     <div className={`file-upload-field ${className}`}>
//       {/* Tooltips */}
//       <Tooltip target=".custom-choose-btn" content="Choose File" position="bottom" />
//       <Tooltip target=".custom-cancel-btn" content="Clear All" position="bottom" />

//       {/* Label */}
//       {(label || required) && (
//         <div className="flex align-items-center gap-2 mb-2">
//           <label className="font-semibold text-gray-700">{label}</label>
//           {required && <Tag value="Required" severity="danger" rounded className="text-xs" />}
//         </div>
//       )}

//       {/* Helper Text */}
//       {helperText && (
//         <div className="mb-2 text-xs text-gray-500 flex align-items-center gap-1">
//           <i className="pi pi-info-circle"></i>
//           <span>{helperText}</span>
//         </div>
//       )}

//       {/* File Upload Component */}
//  <FileUpload
//   ref={fileUploadRef}
//   name={name}
//   accept={accept}
//   maxFileSize={maxFileSize}
//   multiple={false}
//   customUpload
//   auto={false}
//   onSelect={handleSelect}
//   onClear={handleClear}
//   headerTemplate={headerTemplate}
//   itemTemplate={itemTemplate}
//   emptyTemplate={emptyTemplate}
//   chooseOptions={chooseOptions}
//   cancelOptions={cancelOptions}
//   className="border-round shadow-1"
//   style={{ border: '1px solid var(--surface-200)' }}
//   pt={{
//     content: { style: { padding: '0.5rem' } }
//   }}
// />

//       {/* Additional Info */}
//       {/* {selectedFile && (
//         <div className="mt-2 flex align-items-center gap-2 text-xs">
//           <i className="pi pi-check-circle text-green-500"></i>
//           <span className="text-green-600">File ready for upload</span>
//           <span className="text-gray-400 mx-1">•</span>
//           <span className="text-gray-500">Type: {selectedFile.type}</span>
//           <span className="text-gray-400 mx-1">•</span>
//           <span className="text-gray-500">Size: {formatSize(selectedFile.size)}</span>
//         </div>
//       )} */}
//     </div>
//   );
// };

// export default FileUploadField;





import React, { useRef, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import type { FileUploadSelectEvent, FileUploadHeaderTemplateOptions, ItemTemplateOptions } from "primereact/fileupload";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Tooltip } from "primereact/tooltip";
import { useTranslation } from "react-i18next";

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
  maxFileSize = 104857600, 
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif",
  onFileSelect,
  required = false,
  helperText,
  className = "",
}) => {
  const fileUploadRef = useRef<FileUpload | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { t } = useTranslation();


  const handleSelect = (event: FileUploadSelectEvent) => {
    if (!event.files || event.files.length === 0) return;

    const file = event.files[0] as File;
    // Validate file size
    // if (file.size > maxFileSize) {
    //   alert(`File size exceeds ${formatSize(maxFileSize)}`);
    //   return;
    // }

    // Clean up old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Only create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    setSelectedFile(file);
    setTotalSize(file.size);
    onFileSelect?.(file);
  };

  const handleRemove = (callback: () => void) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setTotalSize(0);
    onFileSelect?.(null);
    callback();
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setTotalSize(0);
    onFileSelect?.(null);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 10024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Improved function to get file icon based on file extension and MIME type
  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Image files
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
      return { icon: 'pi-image', color: 'text-purple-500', bgColor: 'bg-purple-50' };
    }
    
    // PDF files
    if (fileType === 'application/pdf' || extension === 'pdf') {
      return { icon: 'pi-file-pdf', color: 'text-red-500', bgColor: 'bg-red-50' };
    }
    
    // Word documents
    if (fileType.includes('word') || fileType === 'application/msword' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        extension === 'doc' || extension === 'docx') {
      return { icon: 'pi-file-word', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
    
    // Excel documents
    if (fileType.includes('excel') || fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        extension === 'xls' || extension === 'xlsx') {
      return { icon: 'pi-file-excel', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
    
    // PowerPoint documents
    if (fileType.includes('powerpoint') || fileType === 'application/vnd.ms-powerpoint' ||
        fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        extension === 'ppt' || extension === 'pptx') {
      return { icon: 'pi-file', color: 'text-orange-500', bgColor: 'bg-orange-50' };
    }
    
    // Text files
    if (fileType === 'text/plain' || extension === 'txt') {
      return { icon: 'pi-file', color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
    
    // Video files
    if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
      return { icon: 'pi-video', color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
    }
    
    // Audio files
    if (fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
      return { icon: 'pi-volume-up', color: 'text-pink-500', bgColor: 'bg-pink-50' };
    }
    
    // Zip files
    if (fileType.includes('zip') || extension === 'zip' || extension === 'rar' || extension === '7z') {
      return { icon: 'pi-box', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    }
    
    // Default
    return { icon: 'pi-file', color: 'text-gray-500', bgColor: 'bg-gray-50' };
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const {  chooseButton, cancelButton } = options;
    const progressValue = (totalSize / maxFileSize) * 100;

    return (
      <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {chooseButton}
            {cancelButton}
          </div>
          
          {totalSize > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="pi pi-database text-blue-500"></i>
                <span className="font-medium">
                  {formatSize(totalSize)} / {formatSize(maxFileSize)}
                </span>
              </div>
              <ProgressBar 
                value={progressValue} 
                showValue={false} 
                style={{ width: '120px', height: '6px' }} 
                className="rounded-full overflow-hidden"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const itemTemplate = (file: any, props: ItemTemplateOptions) => {
    // Get the actual File object from the component's state
    const actualFile = selectedFile;
    const fileName = actualFile?.name || file.name || '';
    const fileType = actualFile?.type || file.type || '';
    
    // Get file icon based on actual file
    // const fileIcon = getFileIcon(fileName, fileType);
    // const isImage = fileType.startsWith('image/') && previewUrl;
    
    // Get file size from the actual file
    const fileSize = actualFile?.size || 0;
    const formattedSize = formatSize(fileSize);
    
    // Format date for display
    const lastModified = actualFile?.lastModified ? new Date(actualFile.lastModified) : new Date();
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Preview/Icon */}
            {/* <div className="flex-shrink-0">
              {isImage ? (
                <img
                  alt={fileName}
                  src={previewUrl || ''}
                  className="w-16 h-16 rounded-lg object-cover shadow-sm"
                />
              ) : (
                <div className={`w-16 h-16 ${fileIcon.bgColor} rounded-lg flex items-center justify-center shadow-sm`}>
                  <i className={`${fileIcon.icon} text-3xl ${fileIcon.color}`}></i>
                </div>
              )}
            </div> */}

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 truncate mb-1">{fileName}</h4>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="pi pi-file text-xs"></i>
                  {formattedSize}
                </span>
                <span className="flex items-center gap-1">
                  <i className="pi pi-calendar text-xs"></i>
                  {lastModified.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <i className="pi pi-tag text-xs"></i>
                  {fileType.split('/').pop()?.toUpperCase() || fileName.split('.').pop()?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              icon="pi pi-times"
              className="p-button-rounded p-button-text p-button-danger p-button-sm"
              tooltip={t("fileUpload.remove")}
              tooltipOptions={{ position: 'top' }}
              onClick={(e) => actualFile && handleRemove( () => props.onRemove(e))}
            />
          </div>
        </div>
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div 
        className={`
          relative flex flex-col items-center justify-center p-1 text-center
          transition-all duration-200 rounded-lg border-2 border-dashed
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={() => setIsDragging(false)}
      >
        {/* Upload Icon */}
        <div className={`
          w-20 h-20 rounded-full flex items-center justify-center mb-4
          transition-all duration-200
          ${isDragging 
            ? 'bg-blue-100 scale-110' 
            : 'bg-gradient-to-br from-blue-100 to-blue-200'
          }
        `}>
          <i className={`
            pi pi-cloud-upload text-4xl transition-all duration-200
            ${isDragging ? 'text-blue-600' : 'text-blue-500'}
          `}></i>
        </div>

        {/* Title */}
        {/* <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
        </h3>
         */}
        {/* Subtitle */}
        {/* <p className="text-sm text-gray-500 mb-4">
          or click to browse from your computer
        </p> */}

        {/* Supported formats */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">PDF</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{t("fileUpload.word")}</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{t("fileUpload.excel")}</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{t("fileUpload.images")}</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{t("common...More")}</span>
        </div>

        {/* File requirements */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <i className="pi pi-check-circle text-green-500 text-xs"></i>
            {t("common.maxfilesize", { size: formatSize(maxFileSize) })}
          </span>
          {/* <span className="flex items-center gap-1">
            <i className="pi pi-lock text-gray-400 text-xs"></i>
            Secure upload
          </span> */}
        </div>
      </div>
    );
  };

  const chooseOptions = {
    icon: "pi pi-fw pi-upload",
    label: t('common.choosefile'),
    className: "bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 rounded-lg transition-colors duration-200",
    style: { 
      backgroundColor: '#2563eb',
      transition: 'background-color 0.2s'
    }
  };

  const cancelOptions = {
    icon: "pi pi-fw pi-trash",
    label: t('common.clearfileselected'),
    className: "bg-gray-200 hover:bg-gray-300 text-gray-700 border-none px-4 py-2 rounded-lg transition-colors duration-200",
    style: { 
      backgroundColor: '#2563eb',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div className={`file-upload-field ${className}`}>
      <Tooltip target=".p-button-text" content={t("fileUpload.removeFile")} position="top" />

      {/* Label Section */}
      {(label || required) && (
        <div className="flex items-center gap-2 mb-3">
          <label className="font-semibold text-gray-700 text-sm">
            {label}
          </label>
          {required && (
            <span className="text-red-500 text-xs bg-red-50 px-2 py-0.5 rounded-full">
              {t('common.required')}
            </span>
          )}
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <div className="mb-3 text-xs text-gray-500 flex items-center gap-1">
          <i className="pi pi-info-circle text-gray-400"></i>
          <span>{helperText}</span>
        </div>
      )}

      {/* File Upload Component */}
      <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <FileUpload
          ref={fileUploadRef}
          name={name}
          accept={accept}
          maxFileSize={1024 * 1024* 100}
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
          className="w-full"
          pt={{
            root: { className: 'w-full' },
            content: { className: 'p-4 bg-white' }
          }}
        />
      </div>

      {/* Selected File Success Message */}
      {/* {selectedFile && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <i className="pi pi-check-circle text-green-600"></i>
            <span className="text-green-700 font-medium">File ready for upload</span>
            <span className="text-green-600 mx-1">•</span>
            <span className="text-green-600 text-xs">
              {selectedFile.name} ({formatSize(selectedFile.size)})
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default FileUploadField;
