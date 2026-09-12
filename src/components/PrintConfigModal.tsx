import React, { useEffect } from 'react';
import { PrintConfig, PrintStyle, PrintColumns } from '../types/printConfig';
import { X, Printer, LayoutGrid, Table, AlignLeft } from 'lucide-react';

interface PrintConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PrintConfig;
  onChange: (config: PrintConfig) => void;
  onPrint: () => void;
}

const STYLE_OPTIONS: { id: PrintStyle; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'cards', label: 'Karty', desc: 'Klasyczne bloczki z obramowaniem i akcentem', icon: LayoutGrid },
  { id: 'table', label: 'Tabela', desc: 'Zwarty układ tabelaryczny dzień po dniu', icon: Table },
  { id: 'minimal', label: 'Minimalistyczny', desc: 'Maksymalna oszczędność tuszu i miejsca', icon: AlignLeft },
];

const COLUMNS_OPTIONS: PrintColumns[] = [1, 2, 3, 4, 5, 6, 7];

export const PrintConfigModal: React.FC<PrintConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  onPrint,
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
      className="fixed inset-0 z-50 flex items-center sm:items-start justify-center p-2.5 sm:px-4 sm:pt-[6vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nagłówek */}
        <div className="flex items-center justify-between h-12 px-4 sm:px-5 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[12.5px] sm:text-[13px] font-semibold text-[var(--text-primary)]">
              Konfiguracja wydruku A4 / PDF
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

        {/* Ciało modala */}
        <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-[11px] overflow-y-auto flex-1">
          {/* Wybór stylu */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Styl wydruku
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = config.style === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ...config, style: opt.id })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)] font-medium shadow-sm'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="font-semibold text-[11px] leading-tight">{opt.label}</span>
                    <span className="text-[9px] text-[var(--text-faint)] leading-tight mt-0.5 line-clamp-2">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wybór kolumn (maks 7) */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <label className="text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Liczba kolumn (maks. 7)
              </label>
              <span className="text-[11px] font-mono text-[var(--accent)] font-semibold">
                {config.columns} {config.columns === 1 ? 'kolumna' : config.columns < 5 ? 'kolumny' : 'kolumn'}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {COLUMNS_OPTIONS.map((col) => {
                const isSelected = config.columns === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => onChange({ ...config, columns: col })}
                    className={`h-8 rounded-lg border font-mono text-[12px] font-semibold transition ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opcje zawartości */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <label className="text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Zawartość i formatowanie
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-subtle)] transition">
                <span className="text-[var(--text-primary)]">Uwzględnij dni regeneracji</span>
                <input
                  type="checkbox"
                  checked={config.showRestDays}
                  onChange={(e) => onChange({ ...config, showRestDays: e.target.checked })}
                  className="rounded border-[var(--border-default)] accent-[var(--accent)] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-subtle)] transition">
                <span className="text-[var(--text-primary)]">Pokaż ciężar / RPE</span>
                <input
                  type="checkbox"
                  checked={config.showWeightRpe}
                  onChange={(e) => onChange({ ...config, showWeightRpe: e.target.checked })}
                  className="rounded border-[var(--border-default)] accent-[var(--accent)] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-subtle)] transition">
                <span className="text-[var(--text-primary)]">Pokaż notatki trenerskie</span>
                <input
                  type="checkbox"
                  checked={config.showNotes}
                  onChange={(e) => onChange({ ...config, showNotes: e.target.checked })}
                  className="rounded border-[var(--border-default)] accent-[var(--accent)] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-subtle)] transition">
                <div>
                  <div className="text-[var(--text-primary)]">Kompaktowe odstępy (zagęszczenie)</div>
                  <div className="text-[9.5px] text-[var(--text-faint)]">Zmniejsza marginesy, aby zmieścić więcej dni na stronie</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.compactSpacing}
                  onChange={(e) => onChange({ ...config, compactSpacing: e.target.checked })}
                  className="rounded border-[var(--border-default)] accent-[var(--accent)] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Stopka */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => onPrint(), 50);
            }}
            className="flex items-center gap-1.5 h-8 px-4 text-[11px] font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Drukuj / Zapisz PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
