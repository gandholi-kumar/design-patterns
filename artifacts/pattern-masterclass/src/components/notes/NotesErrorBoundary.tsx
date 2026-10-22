import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface NotesErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
  resetKey?: unknown;
}

interface NotesErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class NotesErrorBoundary extends Component<
  NotesErrorBoundaryProps,
  NotesErrorBoundaryState
> {
  constructor(props: NotesErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: unknown): NotesErrorBoundaryState {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("NotesErrorBoundary caught an error:", error, errorInfo);
  }

  componentDidUpdate(prevProps: NotesErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.handleReset();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center select-text">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Note Editor Encountered an Issue
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
            A block or command triggered an unexpected rendering error. Your saved notes remain intact in local storage.
          </p>
          {this.state.errorMessage && (
            <div className="mt-3 max-w-sm px-3 py-1.5 rounded-lg bg-card/80 border border-border/80 text-xs font-mono text-muted-foreground overflow-x-auto text-left">
              {this.state.errorMessage}
            </div>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Editor</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
