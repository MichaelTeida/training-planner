import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Anuluj',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl w-full max-w-sm p-4 sm:p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${isDestructive ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]' : 'bg-white/[0.05] text-[var(--text-secondary)]'}`}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug">{title}</h3>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-initial flex items-center justify-center h-8 px-3.5 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center h-8 px-4 text-[11px] font-semibold rounded-lg transition shadow-sm ${
              isDestructive
                ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)]'
                : 'bg-white/[0.1] hover:bg-white/[0.15] text-[var(--text-primary)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
