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
      container: "border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      progress: "bg-gradient-to-r from-green-400 to-green-600",
    },
    error: {
      container: "border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      progress: "bg-gradient-to-r from-red-400 to-red-600",
    },
    warning: {
      container: "border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800",
      icon: "text-yellow-600 dark:text-yellow-400",
      progress: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    },
    info: {
      container: "border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      progress: "bg-gradient-to-r from-blue-400 to-blue-600",
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
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ease-in-out ${isExiting
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

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };



  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating container */}
      <div className="fixed top-5 right-5 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
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
