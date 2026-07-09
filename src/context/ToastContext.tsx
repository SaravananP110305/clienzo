import React, { createContext, useContext, useState, useCallback } from "react";
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiXCircle } from "react-icons/fi";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="size-5 text-success-500" />;
      case "error":
        return <FiXCircle className="size-5 text-error-500" />;
      case "warning":
        return <FiAlertTriangle className="size-5 text-warning-500" />;
      case "info":
        return <FiInfo className="size-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-gray-500 bg-white dark:bg-success-900";
      case "error":
        return "border-gray-500 bg-white dark:bg-error-900";
      case "warning":
        return "border-gray-500 bg-white dark:bg-warning-900";
      case "info":
        return "border-gray-500 bg-white dark:bg-blue-900";
      default:
        return "border-gray-500 bg-white dark:bg-gray-900";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating container */}
      <div className="fixed top-5 right-5 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 transform translate-y-0 ${getTypeStyles(
              toast.type
            )}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 text-sm font-medium text-gray-800 dark:text-white/90">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
            >
              <FiX className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
