import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 for no auto-dismiss
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  progress?: boolean; // Show progress bar for auto-dismiss
  onDismiss?: () => void;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  index: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, index }) => {
  const [progress, setProgress] = useState<number>(100);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    if (!toast.duration || toast.duration === 0) return;

    const duration = toast.duration;
    const interval = 50; // Update every 50ms for smooth animation
    const decrement = 100 / (duration / interval);
    
    setProgress(100);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          handleDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);
    
    const autoCloseTimer = setTimeout(() => {
      handleDismiss();
    }, duration);
    
    return () => {
      clearInterval(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [toast.duration, toast.id]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => {
      onRemove(toast.id);
      toast.onDismiss?.();
    }, 300); // Match the exit animation duration
  }, [toast.id, toast.onDismiss, onRemove]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'info':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getProgressStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out w-full max-w-md
        ${isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : 'translate-x-0 opacity-100 scale-100'
        }
      `}
      style={{
        transform: `translateY(${index * -8}px)`, // Stack effect
        zIndex: 50 - index, // Higher index = lower z-index
      }}
    >
      <div
        className={`
          ${getToastStyles()} text-white rounded-lg shadow-lg border overflow-hidden
        `}
        role="alert"
        aria-live="polite"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{toast.title}</div>
              {toast.message && (
                <div className="mt-1 text-sm opacity-90">{toast.message}</div>
              )}
              {toast.actions && toast.actions.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {toast.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action.onClick}
                      className={`
                        px-3 py-1 text-xs font-medium rounded transition-colors
                        ${action.variant === 'primary' 
                          ? 'bg-white/20 hover:bg-white/30' 
                          : 'bg-white/10 hover:bg-white/20'
                        }
                      `}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 text-white/80 hover:text-white focus:outline-none flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {toast.progress && toast.duration && toast.duration > 0 && (
          <div className={`h-1 ${getProgressStyles()}`}>
            <div 
              className="h-full bg-white/80 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? 5000, // Default 5 seconds
      progress: toastData.progress ?? true, // Default to showing progress
    };
    
    setToasts(prev => [newToast, ...prev]); // Add new toasts at the beginning (top)
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2"
      style={{ 
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'hidden' // Hide toasts that would overflow
      }}
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
        />
      ))}
    </div>
  );
};