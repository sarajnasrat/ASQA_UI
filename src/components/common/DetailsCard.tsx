import React, { useState, useEffect } from "react";

type FieldConfig<T> = {
  label: string;
  name: keyof T;
  type?: "text" | "email" | "url" | "date" | "array" | "object" | "phone" | "number" | "boolean" | "roles";
  format?: (value: any) => string | React.ReactNode;
  colSpan?: "full" | "half";
  fallback?: string | React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  badge?: boolean;
  copyable?: boolean;
};

type DetailsCardProps<T> = {
  data: T;
  fields: FieldConfig<T>[];
  title?: string;
  subtitle?: string;
  imageField?: keyof T;
  imageShape?: "circle" | "square" | "rounded";
  imageSize?: "sm" | "md" | "lg";
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  skeletonCount?: number;
  actions?: React.ReactNode;
  headerClassName?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("DetailsCard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full max-w-7xl mx-auto" role="alert">
          <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-6 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
                <p className="mt-1 text-sm text-red-600">Unable to display details. Please try refreshing the page.</p>
                {this.state.error && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-500 cursor-pointer hover:text-red-700">Error details</summary>
                    <p className="mt-1 text-xs text-red-400 font-mono">{this.state.error.message}</p>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced Skeleton Loader
const SkeletonLoader = ({ count = 4 }: { count?: number }) => (
  <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6 sm:p-8 animate-pulse">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-3 text-center sm:text-left">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto sm:mx-0"></div>
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto sm:mx-0"></div>
      </div>
    </div>
    <div className="my-8 border-t border-gray-100"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  </div>
);

// Copy to Clipboard Hook
const useCopyToClipboard = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return { copiedField, copyToClipboard };
};

function DetailsCard<T extends Record<string, any>>({
  data,
  fields,
  title = "Details",
  subtitle,
  imageField,
  imageShape = "circle",
  imageSize = "md",
  className = "",
  emptyMessage = "Not provided",
  isLoading = false,
  skeletonCount = 4,
  actions,
  headerClassName = "",
  collapsible = false,
  defaultExpanded = true,
}: DetailsCardProps<T>) {
  
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { copiedField, copyToClipboard } = useCopyToClipboard();
  
  // Reset image states when data changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [data, imageField]);
  
  // Safely check if image exists
  const hasImage = !!(imageField && data && data[imageField]);
  const imageUrl = hasImage ? String(data[imageField]) : '';
  const baseUrl = import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  
  // Image size configuration
  const imageSizeClasses = {
    sm: "w-16 h-16 sm:w-20 sm:h-20",
    md: "w-24 h-24 sm:w-32 sm:h-32",
    lg: "w-32 h-32 sm:w-40 sm:h-40",
  };
  
  // Image shape configuration
  const imageShapeClasses = {
    circle: "rounded-full",
    square: "rounded-lg",
    rounded: "rounded-2xl",
  };
  
  // Get initial for placeholder
  const getInitial = () => {
    try {
      const firstField = fields[0]?.name;
      if (firstField && data && data[firstField]) {
        const value = data[firstField];
        if (typeof value === 'string') return value.charAt(0).toUpperCase();
        if (typeof value === 'object' && value !== null) {
          const name = value.name || value.label || value.title || '';
          return name ? name.charAt(0).toUpperCase() : '?';
        }
      }
      return title.charAt(0).toUpperCase();
    } catch {
      return '?';
    }
  };
  
  // Safe toString helper
  const safeToString = (value: any): string => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString('en-US', { dateStyle: 'long' });
    if (Array.isArray(value)) return value.map(item => safeToString(item)).join(', ');
    if (typeof value === 'object') {
      return value.name || value.label || value.title || value.value || 
             value.email || value.roleName || value.displayName || 
             JSON.stringify(value).slice(0, 50);
    }
    return String(value);
  };
  
  // Enhanced field value formatter
  const formatFieldValue = (field: FieldConfig<T>, value: any): React.ReactNode => {
    try {
      if (field.format) return field.format(value);
      
      if (value === undefined || value === null || value === "") {
        return (
          <span className="text-gray-400 italic flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {field.fallback || emptyMessage}
          </span>
        );
      }
      
      // Special handling for roles
      if (field.name === 'roles' || field.type === 'roles' || 
          field.label.toLowerCase().includes('role')) {
        const roles = Array.isArray(value) ? value : [value];
        return (
          <div className="flex flex-wrap gap-1.5">
            {roles.map((role: any, idx: number) => {
              const roleName = typeof role === 'string' ? role : 
                              role?.name || role?.role || role?.roleName || 'Unknown';
              const colors = [
                'bg-blue-100 text-blue-800',
                'bg-purple-100 text-purple-800',
                'bg-green-100 text-green-800',
                'bg-orange-100 text-orange-800',
                'bg-pink-100 text-pink-800'
              ];
              return (
                <span 
                  key={idx}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[idx % colors.length]} transition-colors hover:opacity-80`}
                >
                  {roleName}
                </span>
              );
            })}
          </div>
        );
      }
      
      // Type-based formatting
      switch (field.type) {
        case "email":
          return (
            <div className="flex items-center gap-2 group">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a 
                href={`mailto:${value}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {safeToString(value)}
              </a>
              {field.copyable && (
                <button
                  onClick={() => copyToClipboard(safeToString(value), String(field.name))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                  title="Copy email"
                >
                  {copiedField === String(field.name) ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
          
        case "phone":
          return (
            <div className="flex items-center gap-2 group">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a 
                href={`tel:${value}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {safeToString(value)}
              </a>
            </div>
          );
          
        case "url":
          return (
            <a 
              href={safeToString(value)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors inline-flex items-center gap-1 group"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate max-w-xs sm:max-w-md">{safeToString(value)}</span>
              <svg className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
          
        case "date":
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return safeToString(value);
            return (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            );
          } catch {
            return safeToString(value);
          }
          
        case "boolean":
          return value ? (
            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              No
            </span>
          );
          
        case "array":
          if (Array.isArray(value)) {
            if (value.length === 0) return (
              <span className="text-gray-400 italic">Empty list</span>
            );
            return (
              <div className="flex flex-wrap gap-1.5">
                {value.map((item: any, idx: number) => {
                  const displayValue = typeof item === 'object' ? 
                    (item?.name || item?.label || item?.title || JSON.stringify(item).slice(0, 30)) : 
                    safeToString(item);
                  return (
                    <span 
                      key={idx}
                      className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      title={typeof item === 'object' ? JSON.stringify(item) : undefined}
                    >
                      {displayValue}
                    </span>
                  );
                })}
              </div>
            );
          }
          return safeToString(value);
          
        case "number":
          return (
            <span className="font-mono text-gray-700">
              {typeof value === 'number' ? value.toLocaleString() : safeToString(value)}
            </span>
          );
          
        default:
          return (
            <span className="text-gray-800 wrap-break-word">
              {safeToString(value)}
            </span>
          );
      }
    } catch (error) {
      console.error("Error formatting field value:", error);
      return (
        <span className="text-red-500 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Error displaying value
        </span>
      );
    }
  };
  
  // Loading state
  if (isLoading) {
    return <SkeletonLoader count={skeletonCount} />;
  }
  
  return (
    <ErrorBoundary>
      <div className={`w-full max-w-7xl mx-auto bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl ${className}`}>
        
        {/* Header Section */}
        <div className={`p-6 sm:p-8 ${headerClassName}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Image or Avatar */}
            {hasImage && !imageError && (
              <div className="shrink-0 relative group">
                <div className={`
                  ${imageSizeClasses[imageSize]} 
                  ${imageShapeClasses[imageShape]} 
                  overflow-hidden ring-4 ring-gray-50 shadow-md bg-gray-100
                  ${!imageLoaded ? 'animate-pulse' : ''}
                  transition-transform duration-300 group-hover:scale-105
                `}>
                  <img
                    src={baseUrl + imageUrl}
                    alt={title}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                </div>
                {imageLoaded && (
                  <div className="absolute inset-0 ring-2 ring-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            )}
            
            {/* Image Error Fallback */}
            {hasImage && imageError && (
              <div className="shrink-0">
                <div className={`
                  ${imageSizeClasses[imageSize]} 
                  ${imageShapeClasses[imageShape]} 
                  bg-linear-to-br from-gray-100 to-gray-200
                  flex items-center justify-center shadow-md
                `}>
                  <span className="text-3xl sm:text-4xl font-bold text-gray-400">
                    {getInitial()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                    {subtitle}
                  </span>
                )}
              </div>
              
              {/* Actions */}
              {actions && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {actions}
                </div>
              )}
            </div>
            
            {/* Collapsible Toggle */}
            {collapsible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="border-t border-gray-200"></div>
            
            {fields.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((field, index) => {
                  try {
                    const value = data ? data[field.name] : undefined;
                    const hasValue = value !== undefined && value !== null && value !== "";
                    
                    return (
                      <div 
                        key={`${String(field.name)}-${index}`} 
                        className={`
                          group relative
                          ${field.colSpan === "full" ? "sm:col-span-2 lg:col-span-3" : ""}
                          ${hasValue ? "bg-white" : "bg-gray-50/50"}
                          rounded-xl p-4 hover:bg-gray-50/80 transition-colors duration-200
                        `}
                      >
                        {/* Field Header */}
                        <div className="flex items-center gap-2 mb-2">
                          {field.icon && (
                            <span className="text-gray-400 shrink-0">{field.icon}</span>
                          )}
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            {field.label}
                            {field.description && (
                              <span 
                                className="group/tooltip relative cursor-help"
                                title={field.description}
                              >
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                            )}
                          </label>
                          
                          {/* Copy Button */}
                          {field.copyable && hasValue && (
                            <button
                              onClick={() => copyToClipboard(safeToString(value), String(field.name))}
                              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                              title={`Copy ${field.label}`}
                            >
                              {copiedField === String(field.name) ? (
                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* Field Value */}
                        <div className={`text-sm sm:text-base ${hasValue ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                          {formatFieldValue(field, value)}
                        </div>
                        
                        {/* Badge Indicator */}
                        {field.badge && hasValue && (
                          <div className="absolute top-2 right-2">
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  } catch (error) {
                    console.error(`Error rendering field ${String(field.name)}:`, error);
                    return (
                      <div key={`${String(field.name)}-${index}`} className="sm:col-span-2 lg:col-span-3 bg-red-50 rounded-xl p-4">
                        <label className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                          {field.label}
                        </label>
                        <div className="mt-1 text-sm text-red-500 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Error loading field
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              // Empty State
              <div className="py-16 text-center">
                <svg 
                  className="mx-auto h-16 w-16 text-gray-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No fields configured</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  Add field configurations to display your data in an organized and beautiful way.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        {/* {data && Object.keys(data).length > 0 && isExpanded && (
          <div className="px-6 sm:px-8 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fields.length} field{fields.length !== 1 ? 's' : ''} displayed
              </span>
            </div>
          </div>
        )} */}
      </div>
    </ErrorBoundary>
  );
}

export default DetailsCard;