import { Toast } from "@base-ui/react/toast";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createContext, useCallback, useContext } from "react";

type ToastType = "success" | "error" | "info";

const ToastContext = createContext<((message: string, type?: ToastType) => void) | undefined>(undefined);

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-sage/10 border-sage/20 text-sage-dark",
  error: "bg-terracotta/10 border-terracotta/20 text-terracotta",
  info: "bg-honey/10 border-honey/20 text-primary",
};

const DURATIONS: Record<ToastType, number> = {
  error: 5000,
  success: 3500,
  info: 4000,
};

function ToastViewport() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 items-end pointer-events-none">
      {toasts.map((t) => {
        const type = (t.type as ToastType) ?? "info";
        const Icon = ICONS[type];
        return (
          <Toast.Root
            key={t.id}
            toast={t}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm w-full pointer-events-auto ${STYLES[type]}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <Toast.Title className="flex-1 leading-relaxed" />
            <Toast.Close
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity -mr-1"
              aria-label="Dismiss notification"
            >
              <XMarkIcon className="w-4 h-4" />
            </Toast.Close>
          </Toast.Root>
        );
      })}
    </Toast.Viewport>
  );
}

function ToastBridge({ children }: { children: React.ReactNode }) {
  const { add } = Toast.useToastManager();
  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      add({ title: message, type, timeout: DURATIONS[type] });
    },
    [add],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider>
      <ToastBridge>{children}</ToastBridge>
    </Toast.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (toast === undefined) throw new Error("useToast must be used within a ToastProvider");
  return { toast };
}
