import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Download, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleExportBackup = () => {
    try {
      const rawData = localStorage.getItem('my-purchase-fund-v1');
      if (!rawData) {
        alert('No data found in local storage.');
        return;
      }
      const blob = new Blob([rawData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-purchase-fund-emergency-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export emergency backup: ' + String(e));
    }
  };

  private handleResetData = () => {
    if (window.confirm('Are you sure you want to reset app data? Make sure you have downloaded an emergency backup first.')) {
      localStorage.removeItem('my-purchase-fund-v1');
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--bg, #0f172a)', color: 'var(--text, #f1f5f9)' }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-center"
            style={{
              backgroundColor: 'var(--surface, #1e293b)',
              border: '1.5px solid var(--border, #334155)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                backgroundColor: 'var(--priority-critical-bg, #3f0c0c)',
                color: 'var(--priority-critical-text, #fca5a5)',
              }}
            >
              <AlertOctagon size={28} />
            </div>

            <div>
              <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                An unexpected error prevented the application from rendering. Don't worry — your fund data is stored safely in your browser.
              </p>
            </div>

            {this.state.error && (
              <div
                className="p-3 rounded-xl text-left font-mono text-xs overflow-x-auto max-h-32 select-all"
                style={{
                  backgroundColor: 'var(--surface-2, #253347)',
                  color: 'var(--priority-critical-text, #fca5a5)',
                  border: '1px solid var(--border, #334155)',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
                Reload Page
              </button>

              <button
                onClick={this.handleExportBackup}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-3, #334155)',
                  color: 'var(--text, #f1f5f9)',
                  border: '1px solid var(--border, #475569)',
                }}
              >
                <Download size={15} />
                Rescue Data (JSON)
              </button>

              <button
                onClick={this.handleResetData}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Reset corrupted data"
              >
                <Trash2 size={14} />
                Reset App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
