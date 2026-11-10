import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../utils';
import { ToastContext, type Toast, type ToastType } from './ToastContextDefinition';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border bg-white text-zinc-900 transition-all duration-200',
              toast.type === 'success' && 'border-zinc-200 border-l-4 border-l-emerald-600',
              toast.type === 'error' && 'border-zinc-200 border-l-4 border-l-rose-600',
              toast.type === 'warning' && 'border-zinc-200 border-l-4 border-l-amber-500',
              toast.type === 'info' && 'border-zinc-200 border-l-4 border-l-zinc-900'
            )}
            role="alert"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-zinc-800" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-900 leading-snug">{toast.title}</h4>
              {toast.message && <p className="text-[11px] mt-0.5 text-zinc-500 leading-normal">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
