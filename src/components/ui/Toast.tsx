import { Toast } from "@base-ui/react/toast";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createContext, useCallback, useContext } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

const ToastContext = createContext<((message: string, type?: ToastType) => void) | undefined>(undefined);

const ICONS = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
} satisfies Record<ToastType, typeof CheckCircleIcon>;

const ICON_STYLES: Record<ToastType, string> = {
  success: "text-accent",
  error: "text-clay",
  info: "text-ink-soft",
};

const DURATIONS: Record<ToastType, number> = {
  error: 5000,
  success: 3500,
  info: 4000,
};

function ToastViewport() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Viewport className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col-reverse items-end gap-2 sm:left-auto sm:w-full sm:max-w-sm">
      {toasts.map((toast) => {
        const type: ToastType = toast.type === "success" || toast.type === "error" ? toast.type : "info";
        const Icon = ICONS[type];
        return (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm shadow-lift"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", ICON_STYLES[type])} aria-hidden="true" />
            <Toast.Title className="flex-1 leading-relaxed text-ink" />
            <Toast.Close className="shrink-0 text-muted transition-colors hover:text-ink" aria-label="Dismiss">
              <XMarkIcon className="size-4" />
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
  if (!toast) throw new Error("useToast must be used within a ToastProvider");
  return { toast };
}
