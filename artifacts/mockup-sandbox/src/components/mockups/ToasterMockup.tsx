import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Pause,
  Clock,
  Sun,
  Moon,
  Play,
  RotateCcw,
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface MockToast {
  id: string;
  type: ToastType;
  title: string;
  description: string;
  duration: number; // 10000ms
}

export default function ToasterMockup() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [toasts, setToasts] = useState<MockToast[]>([
    {
      id: "toast-1",
      type: "success",
      title: "Notes Bundle Exported",
      description: "Selective export compiled 3 pattern notes with Base64 embedded diagrams.",
      duration: 10000,
    },
    {
      id: "toast-2",
      type: "warning",
      title: "Import Conflict Detected",
      description: "Singleton notes already exist. Strategy: Append below imported divider.",
      duration: 10000,
    },
  ]);

  const addToast = (type: ToastType) => {
    const titles: Record<ToastType, string> = {
      success: "Export Successful",
      warning: "Collision Strategy Active",
      error: "Schema Validation Error",
      info: "Interactive Toaster Active",
    };
    const descs: Record<ToastType, string> = {
      success: "Saved 23 pattern notes to gof-notes-bundle.json.",
      warning: "2 conflicting patterns will be merged via append divider.",
      error: "Uploaded bundle file failed Zod runtime verification.",
      info: "Hover with your mouse to halt the 10-second countdown!",
    };

    const newToast: MockToast = {
      id: "t-" + Date.now(),
      type,
      title: titles[type],
      description: descs[type],
      duration: 10000,
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      className={`min-h-screen p-8 transition-colors ${
        theme === "dark"
          ? "dark bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mockup Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>Interactive 10s Toaster Mockup</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono">
                10s Countdown + Hover Halt
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              States that the toast auto-closes after 10s. Hover pauses the timer and halts the progress bar; mouse leave resumes smoothly.
            </p>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>Dark Theme</span>
              </>
            )}
          </button>
        </div>

        {/* Control Triggers */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Trigger 10s Notification Toasts
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => addToast("success")}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Trigger Success (10s)</span>
            </button>
            <button
              type="button"
              onClick={() => addToast("warning")}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Trigger Warning (10s)</span>
            </button>
            <button
              type="button"
              onClick={() => addToast("error")}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Trigger Error (10s)</span>
            </button>
            <button
              type="button"
              onClick={() => addToast("info")}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Trigger Info (10s)</span>
            </button>
          </div>
        </div>

        {/* Live Inline Preview Box */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Live Toast Stack ({toasts.length} active)
            </h2>
            <span className="text-xs text-slate-400">
              Hover over any card below to freeze its countdown & progress bar
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {toasts.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400">
                All toasts dismissed. Click any button above to trigger a new 10s toast.
              </div>
            ) : (
              toasts.map((toast) => (
                <MockToastCard
                  key={toast.id}
                  toast={toast}
                  onDismiss={removeToast}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockToastCard({
  toast,
  onDismiss,
}: {
  toast: MockToast;
  onDismiss: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [remainingMs, setRemainingMs] = useState(toast.duration);
  const lastTickRef = useRef<number>(Date.now());
  const rafIdRef = useRef<number | null>(null);

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
        lastTickRef.current = Date.now();
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isHovered, toast.id, onDismiss]);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        lastTickRef.current = Date.now();
        setIsHovered(false);
      }}
      className={`group relative flex flex-col w-full max-w-md rounded-xl bg-white/95 dark:bg-[#121826]/95 border ${borderAccentMap[toast.type]} shadow-xl dark:shadow-2xl backdrop-blur-md overflow-hidden text-slate-900 dark:text-slate-100 transition-all select-text`}
      role="alert"
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className="mt-0.5">{iconMap[toast.type]}</div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">
              {toast.title}
            </h4>

            {/* Countdown Badge / Paused status */}
            <span
              className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                isHovered
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold"
                  : badgeThemeMap[toast.type]
              }`}
            >
              {isHovered ? (
                <>
                  <Pause className="w-2.5 h-2.5 animate-pulse" />
                  <span>Paused</span>
                </>
              ) : (
                <>
                  <Clock className="w-2.5 h-2.5" />
                  <span>{remainingSeconds}s</span>
                </>
              )}
            </span>
          </div>

          {toast.description && (
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {toast.description}
            </p>
          )}

          {/* Status line stating that after 10sec it automatically closes */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400 mt-2 font-sans">
            <span className="flex items-center gap-1">
              {isHovered ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  ⏸ Auto-close paused on mouse hover
                </span>
              ) : (
                <span>Auto-closes in {remainingSeconds}s</span>
              )}
            </span>
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
        />
      </div>
    </div>
  );
}
