import React, { useEffect, useRef } from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  isConfirmation?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  isConfirmation = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Simple confirmation dialogs (size === 'sm' or isConfirmation) remain compact popups on mobile.
  // All major forms and multi-step workflows open as dedicated full-screen mobile pages.
  const isCompactConfirm = isConfirmation || size === 'sm';

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP MODAL (Visible on sm: and up, 100% UNCHANGED)
          OR Compact Confirmation Dialog on all screen sizes
         ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-50 flex ${
          isCompactConfirm
            ? 'items-center justify-center p-4'
            : 'hidden sm:flex sm:items-center sm:justify-center p-4'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      >
        <div
          className={`relative w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden`}
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="px-5 sm:px-6 py-3.5 sm:py-4 border-t flex items-center justify-end gap-3"
              style={{ borderColor: 'var(--border)' }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE DEDICATED FULL-SCREEN APP PAGE (Visible only on < sm screens)
          Dedicated screen navigation for major forms & workflows
         ══════════════════════════════════════════════════════════════════ */}
      {!isCompactConfirm && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex flex-col h-[100dvh] overflow-hidden animate-in fade-in duration-150"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
        >
          {/* Mobile App Navigation Bar */}
          <header
            className="h-14 px-4 flex items-center justify-between border-b flex-shrink-0 shadow-xs"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 py-2 pr-2 text-sm font-semibold cursor-pointer active:opacity-70 transition-opacity"
              style={{ color: 'var(--text)' }}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <h1 className="text-base font-bold truncate text-center flex-1 mx-2" style={{ color: 'var(--text)' }}>
              {title.replace(/^[\p{Emoji}\u2000-\u3300]\s*/u, '')}
            </h1>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-xs font-semibold cursor-pointer active:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </header>

          {/* Mobile Scrollable Form Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 overscroll-contain flex flex-col gap-4">
            {children}
            {/* Scroll buffer spacer guaranteeing the last input/label is 100% visible and accessible */}
            <div className="h-6 flex-shrink-0" />
          </div>

          {/* Mobile Pinned Bottom Action Bar (in flex flow, never covers form content) */}
          {footer && (
            <div
              className="flex-shrink-0 p-3.5 border-t z-20 flex items-center justify-end gap-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] [&>div]:w-full [&>div]:flex [&>div]:items-center [&>div]:gap-2.5 [&_button]:h-12 [&_button]:min-h-[48px] [&_button]:rounded-xl [&_button]:text-sm [&_button]:font-semibold [&_button:last-child]:flex-1 [&_button:first-child]:px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))]"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      )}
    </>
  );
}
