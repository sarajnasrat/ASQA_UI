import React, { useState, useEffect } from "react";

type FieldConfig<T> = {
  label: string;
  name: keyof T;
  type?: "text" | "email" | "url" | "date" | "array" | "object" | "phone" | "number" | "boolean" | "roles";
  format?: (value: any) => string | React.ReactNode;
  colSpan?: "full" | "half";
  fallback?: string | React.ReactNode;
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
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full max-w-5xl mx-auto bg-red-50 shadow-lg rounded-2xl p-6 border border-red-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
            <p className="mt-2 text-sm text-red-600">Unable to display details</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Skeleton Loader Component
const SkeletonLoader = ({ count = 4 }: { count?: number }) => (
  <div className="w-full max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
    <div className="flex items-center gap-6">
      <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="flex-1">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="mt-2 h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
    <div className="my-6 border-t border-gray-200"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

function DetailsCard<T extends Record<string, any>>({
  data,
  fields,
  title = "Details",
  subtitle,
  imageField,
  imageShape = "circle",
  imageSize = "md",
  className = "",
  emptyMessage = "No information available",
  isLoading = false,
  skeletonCount = 4,
}: DetailsCardProps<T>) {
  
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Reset image states when data changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [data, imageField]);
  
  // Safely check if image exists
  const hasImage = !!(imageField && data && data[imageField]);
  const imageUrl = hasImage ? String(data[imageField]) : '';
  
  // Get image size classes
  const imageSizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };
  
  // Get image shape classes
  const imageShapeClasses = {
    circle: "rounded-full",
    square: "rounded-lg",
    rounded: "rounded-xl",
  };
  
  // Get initial for placeholder
  const getInitial = () => {
    try {
      const firstField = fields[0]?.name;
      if (firstField && data && data[firstField]) {
        const value = data[firstField];
        if (typeof value === 'string') {
          return value.charAt(0).toUpperCase();
        }
        if (typeof value === 'object' && value !== null) {
          // Try to get first character of name or first property
          return (value.name || value.label || Object.keys(value)[0] || '?').charAt(0).toUpperCase();
        }
      }
      return title.charAt(0).toUpperCase();
    } catch {
      return title.charAt(0).toUpperCase();
    }
  };
  
  // Helper function to safely convert any value to string
  const safeToString = (value: any): string => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (Array.isArray(value)) {
      return value.map(item => safeToString(item)).join(', ');
    }
    if (typeof value === 'object') {
      // Try common properties first
      if (value.name) return value.name;
      if (value.label) return value.label;
      if (value.title) return value.title;
      if (value.value) return value.value;
      if (value.email) return value.email;
      
      // If it has an id and name, combine them
      if (value.id && value.name) return `${value.name} (ID: ${value.id})`;
      
      // If it's a role object with common patterns
      if (value.roleName) return value.roleName;
      if (value.role) return value.role;
      if (value.displayName) return value.displayName;
      
      // If all else fails, return a string representation of the first few properties
      try {
        const props = Object.keys(value).slice(0, 3).map(key => {
          const val = value[key];
          return typeof val === 'string' || typeof val === 'number' ? val : '';
        }).filter(v => v).join(' ');
        
        return props || JSON.stringify(value).slice(0, 50) + '...';
      } catch {
        return '[Complex Object]';
      }
    }
    return String(value);
  };
  
  // Format field value based on type
  const formatFieldValue = (field: FieldConfig<T>, value: any) => {
    try {
      // If custom formatter provided
      if (field.format) {
        return field.format(value);
      }
      
      // If no value
      if (value === undefined || value === null || value === "") {
        return field.fallback || <span className="text-gray-400 italic">{emptyMessage}</span>;
      }
      
      // Handle specific field types
      if (field.name === 'roles' || field.type === 'roles' || field.label.toLowerCase().includes('role')) {
        // Handle roles specially
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((role, idx) => {
                // Extract role name from various possible formats
                let roleName = '';
                if (typeof role === 'string') roleName = role;
                else if (typeof role === 'object' && role !== null) {
                  roleName = role.name || role.role || role.roleName || role.label || role.title || safeToString(role);
                }
                return (
                  <span 
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {roleName || 'Unknown Role'}
                  </span>
                );
              })}
            </div>
          );
        } else if (typeof value === 'object' && value !== null) {
          const roleName = value.name || value.role || value.roleName || value.label || safeToString(value);
          return (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium inline-block">
              {roleName}
            </span>
          );
        }
      }
      
      // Format based on type
      switch (field.type) {
        case "email":
          return (
            <a 
              href={`mailto:${value}`} 
              className="text-blue-600 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {safeToString(value)}
            </a>
          );
          
        case "phone":
          return (
            <a 
              href={`tel:${value}`} 
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {safeToString(value)}
            </a>
          );
          
        case "url":
          return (
            <a 
              href={safeToString(value)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate block max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {safeToString(value)}
            </a>
          );
          
        case "date":
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return safeToString(value);
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } catch {
            return safeToString(value);
          }
          
        case "boolean":
          return value ? 'Yes' : 'No';
          
        case "array":
          if (Array.isArray(value)) {
            if (value.length === 0) return "-";
            return (
              <div className="flex flex-wrap gap-1">
                {value.map((item, idx) => {
                  // Check if it's an object with common patterns
                  if (typeof item === 'object' && item !== null) {
                    let displayValue = '';
                    if (item.name) displayValue = item.name;
                    else if (item.label) displayValue = item.label;
                    else if (item.title) displayValue = item.title;
                    else if (item.value) displayValue = item.value;
                    else {
                      // Try to get a meaningful value from the object
                      const possibleValues = Object.values(item).filter(v => 
                        typeof v === 'string' && v.length < 50
                      );
                      displayValue = typeof possibleValues[0] === 'string' ? possibleValues[0] : 'Item';
                    }
                    
                    return (
                      <span 
                        key={idx}
                        className="bg-gray-100 px-2 py-1 rounded-md text-xs"
                        title={JSON.stringify(item)}
                      >
                        {displayValue}
                      </span>
                    );
                  }
                  return (
                    <span 
                      key={idx}
                      className="bg-gray-100 px-2 py-1 rounded-md text-xs"
                    >
                      {safeToString(item)}
                    </span>
                  );
                })}
              </div>
            );
          }
          return safeToString(value);
          
        case "object":
          if (typeof value === "object" && value !== null) {
            // Try to get a readable representation
            if (value.name) return value.name;
            if (value.label) return value.label;
            if (value.title) return value.title;
            if (value.email) return value.email;
            
            // If it has multiple properties, show a summary
            const props = Object.keys(value).slice(0, 3).map(key => {
              const val = value[key];
              return typeof val === 'string' || typeof val === 'number' ? val : null;
            }).filter(v => v);
            
            if (props.length > 0) {
              return props.join(' - ');
            }
            
            return JSON.stringify(value);
          }
          return safeToString(value);
          
        default:
          return safeToString(value);
      }
    } catch (error) {
      console.error("Error formatting field value:", error);
      return <span className="text-red-500">Error displaying value</span>;
    }
  };
  
  // Show skeleton loader while loading
  if (isLoading) {
    return <SkeletonLoader count={skeletonCount} />;
  }
  
  // Safely render the component
  return (
    <ErrorBoundary>
      <div className={`w-full max-w-7xl mx-auto bg-white shadow-lg rounded-b-1xl p-6 ${className}`}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          
          {/* Image - Only shown if image exists and no error */}
          {hasImage && !imageError && (
            <div className="shrink-0">
              <div className={`
                ${imageSizeClasses[imageSize]} 
                ${imageShapeClasses[imageShape]} 
                overflow-hidden border-4 border-gray-100 shadow-md bg-gray-100
                ${!imageLoaded ? 'animate-pulse' : ''}
              `}>
                <img
                  src={imageUrl}
                  alt={title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </div>
            </div>
          )}
          
          {/* Image placeholder - Only shown if image field exists but failed to load */}
          {hasImage && imageError && (
            <div className="flex-shrink-0">
              <div className={`
                ${imageSizeClasses[imageSize]} 
                ${imageShapeClasses[imageShape]} 
                overflow-hidden border-4 border-gray-100 shadow-md bg-gray-200
                flex items-center justify-center
              `}>
                <span className="text-3xl font-semibold text-gray-500">
                  {getInitial()}
                </span>
              </div>
            </div>
          )}
          
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800 truncate">
                {title}
              </h2>
              {subtitle && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="my-6 border-t border-gray-200"></div>
        
        {/* Dynamic Fields - Only show if fields exist */}
        {fields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => {
              try {
                const value = data ? data[field.name] : undefined;
                const hasValue = value !== undefined && value !== null && value !== "";
                
                return (
                  <div 
                    key={`${String(field.name)}-${index}`} 
                    className={`
                      ${field.colSpan === "full" ? "md:col-span-2" : ""}
                      ${!hasValue ? "opacity-70" : ""}
                    `}
                  >
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <div className="mt-1 text-gray-800 break-words">
                      {formatFieldValue(field, value)}
                    </div>
                  </div>
                );
              } catch (error) {
                console.error(`Error rendering field ${String(field.name)}:`, error);
                return (
                  <div key={`${String(field.name)}-${index}`} className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <div className="mt-1 text-red-500">
                      Error loading field
                    </div>
                  </div>
                );
              }
            })}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fields to display</h3>
            <p className="mt-1 text-sm text-gray-500">Configure fields to show data.</p>
          </div>
        )}
        
        {/* Footer with metadata (optional) */}
        {data && Object.keys(data).length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 flex justify-end">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default DetailsCard;