import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Pause,
  Clock,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // default 10000ms (10s)
}

interface ActiveToast extends Required<Omit<ToastOptions, "action" | "description">> {
  description?: string;
  action?: ToastOptions["action"];
}

// Global subscribers for toast events
type Listener = (toasts: ActiveToast[]) => void;
const listeners = new Set<Listener>();
let activeToasts: ActiveToast[] = [];

function notifyListeners() {
  for (const listener of listeners) {
    listener([...activeToasts]);
  }
}

export const appToast = {
  show(options: ToastOptions) {
    const id = options.id || Math.random().toString(36).substring(2, 9);
    const toastItem: ActiveToast = {
      id,
      type: options.type || "info",
      title: options.title,
      description: options.description,
      action: options.action,
      duration: options.duration ?? 10000, // 10 seconds default
    };

    activeToasts = [toastItem, ...activeToasts].slice(0, 4); // Max 4 toasts stacked
    notifyListeners();
    return id;
  },

  success(title: string, description?: string, action?: ToastOptions["action"]) {
    return this.show({ type: "success", title, description, action });
  },

  error(title: string, description?: string, action?: ToastOptions["action"]) {
    return this.show({ type: "error", title, description, action });
  },

  warning(title: string, description?: string, action?: ToastOptions["action"]) {
    return this.show({ type: "warning", title, description, action });
  },

  info(title: string, description?: string, action?: ToastOptions["action"]) {
    return this.show({ type: "info", title, description, action });
  },

  dismiss(id: string) {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    notifyListeners();
  },
};

// Single Toast Card with Pause-on-Hover 10s Countdown and Haltable Progress Bar
function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ActiveToast;
  onDismiss: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [remainingMs, setRemainingMs] = useState(toast.duration);
  const lastTickRef = useRef<number>(Date.now());
  const rafIdRef = useRef<number | null>(null);

  // High-precision RAF loop ensuring smooth 60fps bar and instant freeze on hover
  useEffect(() => {
    lastTickRef.current = Date.now();

    const tick = () => {
      if (!isHovered) {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        setRemainingMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            onDismiss(toast.id);
            return 0;
          }
          return next;
        });
      } else {
        // While hovered, refresh reference so delta remains 0
        lastTickRef.current = Date.now();
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isHovered, toast.id, onDismiss]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    lastTickRef.current = Date.now();
    setIsHovered(false);
  }, []);

  const progressPercent = Math.max(
    0,
    Math.min(100, (remainingMs / toast.duration) * 100)
  );

  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  const borderAccentMap = {
    success: "border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/10",
    error: "border-rose-500/30 dark:border-rose-500/40 shadow-rose-500/10",
    warning: "border-amber-500/30 dark:border-amber-500/40 shadow-amber-500/10",
    info: "border-blue-500/30 dark:border-blue-500/40 shadow-blue-500/10",
  };

  const progressBgMap = {
    success: "bg-emerald-500 dark:bg-emerald-400",
    error: "bg-rose-500 dark:bg-rose-400",
    warning: "bg-amber-500 dark:bg-amber-400",
    info: "bg-blue-500 dark:bg-blue-400",
  };

  const badgeThemeMap = {
    success: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    error: "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
    warning: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    info: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col w-88 max-w-[calc(100vw-2rem)] rounded-xl bg-white/95 dark:bg-[#121826]/95 border ${borderAccentMap[toast.type]} shadow-xl dark:shadow-2xl backdrop-blur-md overflow-hidden text-slate-900 dark:text-slate-100 transition-all duration-200 select-text`}
      role="alert"
      aria-live="assertive"
      data-testid={`toast-${toast.type}`}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className="mt-0.5">{iconMap[toast.type]}</div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
              {toast.title}
            </h4>

            {/* Countdown Badge / Paused status */}
            <span
              className={`shrink-0 inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border transition-colors ${
                isHovered
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold"
                  : badgeThemeMap[toast.type]
              }`}
            >
              {isHovered ? (
                <>
                  <Pause className="w-3 h-3 animate-pulse" />
                  <span>Paused</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  <span>{remainingSeconds}s</span>
                </>
              )}
            </span>
          </div>

          {toast.description && (
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {toast.description}
            </p>
          )}

          {/* Status line stating that after 10sec it automatically closes */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-sans">
            <span className="flex items-center gap-1">
              {isHovered ? (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  ⏸ Auto-close paused on mouse hover
                </span>
              ) : (
                <span>Auto-closes in {remainingSeconds}s</span>
              )}
            </span>

            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline underline-offset-2"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 10s Countdown Progress Bar: halts on hover and resumes on mouse leave */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
        <div
          className={`h-full ${progressBgMap[toast.type]} origin-left transition-none`}
          style={{
            width: `${progressPercent.toFixed(2)}%`,
          }}
          data-testid="toast-progress-bar"
        />
      </div>
    </div>
  );
}

export function AppToaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-auto"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={(id) => appToast.dismiss(id)}
        />
      ))}
    </div>
  );
}
