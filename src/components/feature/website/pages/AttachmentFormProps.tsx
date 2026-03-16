// components/feature/registration/AttachmentForm.tsx
import React, { useState } from 'react';
import { FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppToast } from '../../../../hooks/useToast';
import AttachmentService from '../../../../services/attachment.service';

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
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const AttachmentForm: React.FC<AttachmentFormProps> = ({
  companyId,
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting
}) => {
  const { showToast } = useAppToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const acceptedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, images, or Word documents.';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles: UploadedFile[] = [];

    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        showToast('error', 'error', "validateFile(file)");
      } else {
        validFiles.push({
          file,
          progress: 0,
          status: 'pending'
        });
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async (file: UploadedFile, index: number) => {
    // Update status to uploading
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' } : f
    ));

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, progress } : f
      ));
    }

    // Simulate success (in real app, you'd call your API here)
    try {
      // const formData = new FormData();
      // formData.append('file', file.file);
      // formData.append('companyId', companyId.toString());
      // await AttachmentService.upload(formData);

      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'success' } : f
      ));
    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: 'Upload failed' } : f
      ));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (files.length === 0) {
    showToast('error', 'Error', 'Please select at least one file');
    return;
  }

  setIsSubmitting(true);

  try {

    for (let i = 0; i < files.length; i++) {

      if (files[i].status === 'success') continue;

      // set uploading state
      setFiles(prev =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading', progress: 30 } : f
        )
      );

      try {

        await AttachmentService.create(
          files[i].file,
          files[i].file.name,
          companyId
        );

        // success state
        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'success', progress: 100 } : f
          )
        );

      } catch (err: any) {

        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: 'error',
                  error: err?.response?.data?.message || 'Upload failed'
                }
              : f
          )
        );

        showToast('error', 'Error', 'File upload failed');
        setIsSubmitting(false);
        return;
      }
    }

    showToast('success', 'Success', 'All files uploaded successfully');
    onSuccess();

  } catch (error) {
    showToast('error', 'Error', 'Upload process failed');
  } finally {
    setIsSubmitting(false);
  }
};

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <img src={URL.createObjectURL(file)} alt={file.name} className="h-10 w-10 object-cover rounded" />;
    }
    return <FileText className="h-10 w-10 text-blue-600" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <FileText className="h-6 w-6 text-blue-600 mr-2" />
        Upload Documents
      </h2>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supported formats: PDF, Images (JPG, PNG), Word Documents (Max 10MB each)
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label
          htmlFor="file-upload"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Browse Files
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Uploaded Files ({files.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  file.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(file.file)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{file.file.name}</span>
                      {getStatusIcon(file.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    
                    {/* Progress bar for uploading */}
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{file.progress}%</span>
                      </div>
                    )}

                    {/* Error message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                
                {file.status !== 'uploading' && (
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

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting || files.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            'Complete Registration'
          )}
        </button>
      </div>
    </form>
  );
};

export default AttachmentForm;