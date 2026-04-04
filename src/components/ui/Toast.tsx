import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
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
  info: "bg-honey/10 border-honey/20 text-charcoal",
};

// Errors stay visible longer since they're important
const DURATIONS: Record<ToastType, number> = {
  success: 3500,
  error: 5000,
  info: 4000,
};

function ToastItem({ toast: t, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const Icon = ICONS[t.type];
  return (
    <div
      role={t.type === "error" ? "alert" : "status"}
      aria-live={t.type === "error" ? "assertive" : "polite"}
      style={{ animation: t.exiting ? "toastExit 0.25s ease-in forwards" : "toastEnter 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards" }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm w-full pointer-events-auto ${STYLES[t.type]}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="flex-1 leading-relaxed">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity -mr-1"
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    // Mark as exiting to trigger exit animation
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    // Remove after animation completes
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 280);
    timers.current.set(id, timer);
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    const duration = DURATIONS[type];
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  // Clean up timers on unmount
  useEffect(() => {
    const currentTimers = timers.current;
    return () => { currentTimers.forEach(clearTimeout); };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === undefined) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
