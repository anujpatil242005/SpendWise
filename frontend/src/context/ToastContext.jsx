import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Trigger floating alert
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss alert
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Icon and color mappings for custom HSL categories
  const configMap = {
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      shadow: 'shadow-emerald-500/10'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-950/40',
      border: 'border-red-500/30',
      text: 'text-red-400',
      shadow: 'shadow-red-500/10'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      shadow: 'shadow-amber-500/10'
    },
    info: {
      icon: Info,
      bg: 'bg-primary/20',
      border: 'border-primary/30',
      text: 'text-primary',
      shadow: 'shadow-primary/10'
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 w-full max-w-sm pointer-events-none font-sans">
        {toasts.map((toast) => {
          const cfg = configMap[toast.type] || configMap.info;
          const Icon = cfg.icon;

          return (
            <div 
              key={toast.id}
              className={`p-4 rounded-2xl glass-panel border flex gap-3 items-start pointer-events-auto transition-all duration-300 shadow-lg animate-slide-in-right ${cfg.bg} ${cfg.border} ${cfg.shadow}`}
            >
              <div className={`mt-0.5 shrink-0 ${cfg.text}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 text-xs text-white font-medium text-left leading-relaxed">
                {toast.message}
              </div>
              <button 
                onClick={() => dismissToast(toast.id)}
                className="text-muted-foreground hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
