import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTime = useRef<number>(Date.now());
  const duration = 4000;
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const typeStyles = {
    success: {
      container:
        "border-success-500 bg-success-50 dark:bg-success-500/15",
      icon: "text-success-500",
      progress: "bg-success-500",
    },
    error: {
      container:
        "border-error-500 bg-error-50 dark:bg-error-500/15",
      icon: "text-error-500",
      progress: "bg-error-500",
    },
    warning: {
      container:
        "border-warning-500 bg-warning-50 dark:bg-warning-500/15",
      icon: "text-warning-500",
      progress: "bg-warning-500",
    },
    info: {
      container:
        "border-blue-500 bg-blue-50 dark:bg-blue-500/15",
      icon: "text-blue-500",
      progress: "bg-blue-500",
    },
  };

  const icons = {
    success: <FiCheckCircle className="size-5" />,
    error: <FiXCircle className="size-5" />,
    warning: <FiAlertTriangle className="size-5" />,
    info: <FiInfo className="size-5" />,
  };

  const styles = typeStyles[toast.type];

  return (
    <div
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ease-in-out ${
        isExiting
          ? "opacity-0 translate-x-full scale-95"
          : "opacity-100 translate-x-0 translate-y-0 scale-100 animate-slide-in-right"
      } ${styles.container}`}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className={`shrink-0 mt-0.5 ${styles.icon}`}>{icons[toast.type]}</div>
        <div className="flex-1 text-sm font-medium text-gray-800 dark:text-white/90">
          {toast.message}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white/80 transition-colors cursor-pointer rounded-md hover:bg-gray-200/50 dark:hover:bg-white/10"
        >
          <FiX className="size-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200/40 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-75 ease-linear ${styles.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating container - top right */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
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
