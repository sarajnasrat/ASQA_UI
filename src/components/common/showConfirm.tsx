import { confirmDialog } from "primereact/confirmdialog";
import React from "react";

type ConfirmOptions = {
  title?: string;
  message: string | React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: "danger" | "warning" | "info" | "success";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  hideIcon?: boolean;
  persistent?: boolean;
  closeOnEscape?: boolean;
  position?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  animation?: "fade" | "slide" | "scale" | "none";
  confirmButtonProps?: {
    outlined?: boolean;
    rounded?: boolean;
    raised?: boolean;
    icon?: string;
    iconPos?: "left" | "right";
  };
  cancelButtonProps?: {
    outlined?: boolean;
    rounded?: boolean;
    raised?: boolean;
    icon?: string;
    iconPos?: "left" | "right";
  };
};

const severityStyles = {
  danger: {
    icon: "pi pi-trash",
    iconColor: "text-rose-600",
    gradient: "from-rose-500 to-pink-600",
    btnBg: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700",
    btnText: "text-white",
    border: "border-rose-200",
    lightBg: "bg-rose-50",
    shadow: "shadow-rose-200/50",
    ring: "focus:ring-rose-500",
    badge: "bg-rose-100 text-rose-700",
  },
  warning: {
    icon: "pi pi-exclamation-triangle",
    iconColor: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    btnBg: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    btnText: "text-white",
    border: "border-amber-200",
    lightBg: "bg-amber-50",
    shadow: "shadow-amber-200/50",
    ring: "focus:ring-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  info: {
    icon: "pi pi-info-circle",
    iconColor: "text-sky-600",
    gradient: "from-sky-500 to-blue-600",
    btnBg: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
    btnText: "text-white",
    border: "border-sky-200",
    lightBg: "bg-sky-50",
    shadow: "shadow-sky-200/50",
    ring: "focus:ring-sky-500",
    badge: "bg-sky-100 text-sky-700",
  },
  success: {
    icon: "pi pi-check-circle",
    iconColor: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
    btnBg: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
    btnText: "text-white",
    border: "border-emerald-200",
    lightBg: "bg-emerald-50",
    shadow: "shadow-emerald-200/50",
    ring: "focus:ring-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

const sizeStyles = {
  sm: {
    container: "p-4 max-w-sm",
    icon: "w-14 h-14 text-xl",
    title: "text-lg",
    message: "text-sm",
    buttons: "px-4 py-1.5 text-sm",
  },
  md: {
    container: "p-6 max-w-md",
    icon: "w-16 h-16 text-2xl",
    title: "text-xl",
    message: "text-base",
    buttons: "px-6 py-2 text-sm",
  },
  lg: {
    container: "p-8 max-w-lg",
    icon: "w-20 h-20 text-3xl",
    title: "text-2xl",
    message: "text-lg",
    buttons: "px-8 py-2.5 text-base",
  },
};

const animationStyles = {
  fade: "animate-fadeIn",
  slide: "animate-slideIn",
  scale: "animate-scaleIn",
  none: "",
};

export const showConfirm = ({
  title = "Confirmation",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes, proceed",
  cancelLabel = "Cancel",
  severity = "danger",
  size = "md",
  icon,
  hideIcon = false,
  persistent = false,
  closeOnEscape = true,
  position = "center",
  animation = "scale",
  confirmButtonProps = {},
  cancelButtonProps = {},
}: ConfirmOptions) => {
  const styles = severityStyles[severity];
  const sizeConfig = sizeStyles[size];
  const animationClass = animationStyles[animation];

  const positionMap = {
    center: undefined,
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    "top-left": "topleft",
    "top-right": "topright",
    "bottom-left": "bottomleft",
    "bottom-right": "bottomright",
  };

  const getButtonClass = (
    type: "confirm" | "cancel",
    customProps: { outlined?: boolean; rounded?: boolean; raised?: boolean }
  ) => {
    const baseClasses = "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";
    const sizeClasses = sizeConfig.buttons;
    
    if (type === "confirm") {
      const outlined = customProps.outlined;
      if (outlined) {
        return `${baseClasses} ${sizeClasses} border-2 ${styles.border} ${styles.iconColor} bg-transparent hover:${styles.lightBg} ${styles.ring}`;
      }
      return `${baseClasses} ${sizeClasses} ${styles.btnBg} ${styles.btnText} ${styles.ring} ${customProps.rounded ? "rounded-full" : "rounded-lg"} ${customProps.raised ? "shadow-xl" : ""}`;
    } else {
      const outlined = customProps.outlined;
      if (outlined) {
        return `${baseClasses} ${sizeClasses} border-2 border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50 focus:ring-gray-400 ${customProps.rounded ? "rounded-full" : "rounded-lg"}`;
      }
      return `${baseClasses} ${sizeClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400 shadow-md hover:shadow-lg ${customProps.rounded ? "rounded-full" : "rounded-lg"}`;
    }
  };

  // Create a wrapper function to handle confirmation
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Completely hide default buttons and use our custom ones
  confirmDialog({
    message: (
      <div className={`flex flex-col items-center gap-5 ${sizeConfig.container} ${animationClass} relative`}>
        {/* Decorative top gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.gradient} rounded-t-xl`}></div>
        
        {/* Icon Section */}
        {!hideIcon && (
          <div className="relative mt-2">
            <div className={`absolute inset-0 rounded-full ${styles.lightBg} animate-ping opacity-25`}></div>
            <div
              className={`
                relative ${sizeConfig.icon} rounded-full flex items-center justify-center
                bg-gradient-to-br ${styles.gradient} bg-opacity-10 shadow-xl
                border-2 border-white ring-4 ring-white ring-opacity-50
                transform transition-transform hover:scale-110 duration-300
              `}
            >
              <i className={`${icon || styles.icon} text-white drop-shadow-lg`}></i>
            </div>
            {severity === "danger" && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-bounce"></div>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className={`font-bold text-gray-900 ${sizeConfig.title} text-center`}>
          {title}
        </h3>

        {/* Message */}
        <div className={`text-gray-600 text-center leading-relaxed ${sizeConfig.message}`}>
          {typeof message === "string" ? (
            <div className="space-y-2">
              <p>{message}</p>
              {severity === "danger" && (
                <p className="text-xs text-gray-500 mt-2">
                  This action cannot be undone
                </p>
              )}
            </div>
          ) : (
            message
          )}
        </div>

        {/* Custom Action Buttons */}
        <div className="flex gap-3 w-full mt-4">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => {
              // Find and click the reject button programmatically
              const rejectBtn = document.querySelector('.p-confirm-dialog-reject');
              if (rejectBtn) {
                (rejectBtn as HTMLElement).click();
              } else {
                handleCancel();
              }
            }}
            className={`
              flex-1 flex items-center justify-center gap-2 cursor-pointer
              ${getButtonClass("cancel", cancelButtonProps)}
            `}
          >
            {cancelButtonProps.icon && cancelButtonProps.iconPos !== "right" && (
              <i className={cancelButtonProps.icon}></i>
            )}
            {cancelLabel}
            {cancelButtonProps.icon && cancelButtonProps.iconPos === "right" && (
              <i className={cancelButtonProps.icon}></i>
            )}
          </button>
          
          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => {
              // Find and click the accept button programmatically
              const acceptBtn = document.querySelector('.p-confirm-dialog-accept');
              if (acceptBtn) {
                (acceptBtn as HTMLElement).click();
              } else {
                handleConfirm();
              }
            }}
            className={`
              flex-1 flex items-center justify-center gap-2 cursor-pointer
              ${getButtonClass("confirm", confirmButtonProps)}
            `}
          >
            {confirmButtonProps.icon && confirmButtonProps.iconPos !== "right" && (
              <i className={confirmButtonProps.icon}></i>
            )}
            {confirmLabel}
            {confirmButtonProps.icon && confirmButtonProps.iconPos === "right" && (
              <i className={confirmButtonProps.icon}></i>
            )}
          </button>
        </div>

        {/* Hint text for persistent dialogs */}
        {persistent && (
          <p className="text-xs text-gray-400 mt-2">
            Press ESC to cancel
          </p>
        )}
      </div>
    ),
    header: "",
    icon: "",
    // Hide the default buttons completely
    acceptLabel: confirmLabel,
    rejectLabel: cancelLabel,
    acceptClassName: "hidden", // This hides the default accept button
    rejectClassName: "hidden", // This hides the default reject button
    accept: handleConfirm,
    reject: handleCancel,
    closeOnEscape: closeOnEscape && !persistent,
    dismissableMask: !persistent,
    draggable: false,
    position: positionMap[position] as any,
    breakpoints: {
      "960px": "90vw",
      "640px": "95vw",
      "480px": "98vw",
    },
    style: {
      borderRadius: "1rem",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    contentStyle: {
      padding: 0,
      overflow: "hidden",
    },
    // Additional props to ensure only one dialog appears
    appendTo: "self",
    closable: false, // Hide the default close icon
  });
};