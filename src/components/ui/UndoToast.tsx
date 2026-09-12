import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, X, CheckCircle, Info } from 'lucide-react';
import { usePurchaseStore } from '../../store/usePurchaseStore';

const UNDO_DURATION = 5000; // ms
const TOAST_DURATION = 3500; // ms

export function UndoToast() {
  const { undoLabel, undo, clearUndo, toastMessage, toastType, clearToast } = usePurchaseStore();
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // Undo countdown timer
  useEffect(() => {
    if (!undoLabel) {
      setProgress(100);
      return;
    }

    setProgress(100);
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      clearUndo();
    }, UNDO_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [undoLabel, clearUndo]);

  // Standard toast auto-dismiss timer
  useEffect(() => {
    if (undoLabel || !toastMessage) return;

    const t = setTimeout(() => {
      clearToast();
    }, TOAST_DURATION);

    return () => clearTimeout(t);
  }, [toastMessage, undoLabel, clearToast]);

  // If nothing to display, render null
  if (!undoLabel && !toastMessage) return null;

  function handleUndo() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    undo();
  }

  function handleDismissUndo() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    clearUndo();
  }

  // Render Undo Toast if active
  if (undoLabel) {
    return (
      <div
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto rounded-2xl overflow-hidden shadow-xl"
          style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)' }}
        >
          {/* Countdown bar */}
          <div className="h-1 w-full" style={{ backgroundColor: 'var(--surface-3)' }}>
            <div
              className="h-full bg-indigo-500 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="flex items-center gap-3 px-4 py-3">
            <p className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {undoLabel}
            </p>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors flex-shrink-0 cursor-pointer"
            >
              <RotateCcw size={13} />
              Undo
            </button>
            <button
              onClick={handleDismissUndo}
              className="p-1 rounded-lg transition-colors hover:opacity-70 flex-shrink-0 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Success / Info Toast
  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none transition-all duration-200"
    >
      <div
        className="pointer-events-auto rounded-2xl overflow-hidden shadow-xl flex items-center gap-3 px-4 py-3 animate-in fade-in slide-in-from-bottom-3"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1.5px solid var(--border)',
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: toastType === 'info' ? 'var(--accent-allocated-bg)' : 'var(--accent-free-bg)',
            color: toastType === 'info' ? 'var(--accent-allocated)' : 'var(--accent-free)',
          }}
        >
          {toastType === 'info' ? <Info size={15} /> : <CheckCircle size={15} />}
        </div>
        <p className="flex-1 text-sm font-medium" style={{ color: 'var(--text)' }}>
          {toastMessage}
        </p>
        <button
          onClick={clearToast}
          className="p-1 rounded-lg transition-colors hover:opacity-70 flex-shrink-0 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
