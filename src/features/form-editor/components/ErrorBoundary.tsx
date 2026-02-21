import React from "react";
import type { EditorSection } from "../editorConfig";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  recovered: boolean;
}

const STORAGE_KEY = "editor_emergency_save";

// Save sections to localStorage before error propagates
export function emergencySave(sections: EditorSection[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sections, savedAt: Date.now() }),
    );
  } catch {
    /* quota or private mode */
  }
}

export function getEmergencySave(): {
  sections: EditorSection[];
  savedAt: number;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearEmergencySave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, recovered: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, recovered: true });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;
    const saved = getEmergencySave();

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f8fafc",
          fontFamily: "'Open Sans', Arial, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#fff",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                Something went wrong
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                The editor encountered an unexpected error
              </p>
            </div>
          </div>

          {/* Recovery info */}
          {saved && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Your work was auto-saved — it will be restored on reload.
            </div>
          )}

          {/* Error details (dev only) */}
          {isDev && this.state.error && (
            <details style={{ marginBottom: "20px" }}>
              <summary
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  cursor: "pointer",
                  marginBottom: "8px",
                  userSelect: "none",
                }}
              >
                Error details (dev mode)
              </summary>
              <pre
                style={{
                  fontSize: "11px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "12px",
                  overflow: "auto",
                  color: "#dc2626",
                  maxHeight: "180px",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={this.handleReload}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reload Editor
            </button>
            <button
              onClick={this.handleDismiss}
              style={{
                padding: "10px 16px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Try to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}
