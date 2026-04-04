import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-sage/10 border-sage/20 text-sage-dark",
  error: "bg-terracotta/10 border-terracotta/20 text-terracotta",
  info: "bg-blue-50 border-blue-100 text-blue-700",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-hover text-sm max-w-sm pointer-events-auto animate-slide-up ${STYLES[t.type]}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === undefined) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
