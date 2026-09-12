import React, { useEffect } from 'react';
import { TrainingProgram } from '../types/planner';
import { ThemeId, THEMES } from '../types/theme';
import { TEMPLATES } from '../storage/templates';
import { X, Settings2, Palette, FileDown, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: TrainingProgram;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onUpdateTotalDays: (count: number) => void;
  onUpdateStartDate: (date: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onResetAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  program,
  currentTheme,
  onThemeChange,
  onUpdateTotalDays,
  onUpdateStartDate,
  onLoadTemplate,
  onResetAll,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center sm:items-start justify-center p-3 sm:px-4 sm:pt-[6vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nagłówek */}
        <div className="flex items-center justify-between h-12 px-4 sm:px-5 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
              Ustawienia planu i wyglądu
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Zawartość z płynnym scrollem */}
        <div className="p-4 sm:p-5 space-y-4 text-[11px] overflow-y-auto flex-1">
          {/* Motyw kolorystyczny */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 font-semibold text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)]">
                <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
                Motyw kolorystyczny
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {THEMES.map((th) => {
                const isSelected = currentTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => onThemeChange(th.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)] font-medium shadow-sm'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm border border-black/20"
                      style={{ backgroundColor: th.dotColor }}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[11px] leading-tight font-medium">{th.name}</div>
                      <span className="text-[9.5px] text-[var(--text-faint)] leading-none block mt-0.5">
                        {th.isDark ? 'Ciemny' : 'Jasny'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parametry cyklu */}
          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
            <span className="font-semibold text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)] block">
              Parametry cyklu
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[var(--text-muted)] text-[10.5px]">Liczba dni w cyklu</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={program.totalDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) onUpdateTotalDays(val);
                  }}
                  className="w-full h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2.5 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--border-default)] transition font-mono"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[var(--text-muted)] text-[10.5px]">Data rozpoczęcia</span>
                <input
                  type="date"
                  value={program.startDate}
                  onChange={(e) => onUpdateStartDate(e.target.value)}
                  className="w-full h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2.5 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--border-default)] cursor-pointer transition font-mono"
                />
              </label>
            </div>
          </div>

          {/* Szablony */}
          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
            <span className="font-semibold text-[10.5px] uppercase tracking-wider text-[var(--text-secondary)] block">
              Gotowe szablony treningowe
            </span>
            <div className="space-y-1">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onLoadTemplate(t.id);
                  }}
                  className="w-full text-left px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-soft)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl transition flex items-center gap-2"
                >
                  <FileDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate text-[11px] font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onResetAll();
              }}
              className="w-full text-left px-3 py-2 text-[var(--accent)] hover:opacity-90 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-xl transition flex items-center gap-2 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Wyczyść cały plan do zera</span>
            </button>
          </div>
        </div>

        {/* Stopka */}
        <div className="flex items-center justify-end px-4 sm:px-5 py-3 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--bg-elevated)]">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-[11px] font-medium text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-lg transition"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
