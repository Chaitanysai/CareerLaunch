import { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with Sentry.captureException(error) when you add Sentry
    console.error("CareerLaunch caught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center p-8"
          style={{ background: "var(--surface-container-low)" }}>
          <div className="max-w-md w-full text-center">
            {/* Logo mark */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--surface-container-highest)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--outline)" }}>
                error_outline
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-2"
              style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--on-surface-variant)" }}>
              CareerLaunch hit an unexpected error. Your data is safe.
            </p>

            {/* Error detail (only in dev) */}
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs p-4 rounded-xl mb-6 overflow-auto"
                style={{ background: "#fee2e2", color: "#991b1b", maxHeight: 200 }}>
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary-s px-6 py-3">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                Reload page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/dashboard"; }}
                className="btn-ghost-s px-6 py-3">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
