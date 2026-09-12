import React from 'react';
import { Printer, Share2, Plus, Settings2, BarChart3, List, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { ViewMode, TrainingProgram } from '../types/planner';

interface HeaderProps {
  program: TrainingProgram;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddDay: () => void;
  onOpenExport: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onPrint: () => void;
  onUpdateTitle: (title: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  program,
  viewMode,
  onViewModeChange,
  onAddDay,
  onOpenExport,
  onOpenStats,
  onOpenSettings,
  onPrint,
  onUpdateTitle,
}) => {
  const trainingCount = program.days.filter((d) => !d.isRestDay).length;
  const restCount = program.days.filter((d) => d.isRestDay).length;

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto h-12 flex items-center justify-between px-2 sm:px-4 gap-1.5 sm:gap-2">

        {/* Tytuł i statystyki */}
        <div className="flex items-center min-w-0 flex-1 mr-1 sm:mr-3">
          <input
            type="text"
            value={program.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="w-full bg-transparent text-[12px] sm:text-[13px] font-semibold text-[var(--text-primary)] hover:opacity-90 rounded px-1 sm:px-1.5 py-0.5 border border-transparent focus:border-[var(--border-default)] outline-none transition-colors truncate"
            title="Kliknij, aby zmienić nazwę planu"
          />
          <span className="text-[10.5px] sm:text-[11px] text-[var(--text-muted)] font-mono tabular-nums hidden lg:inline shrink-0 ml-1.5">
            {trainingCount}T · {restCount}R · {program.totalDays}d
          </span>
        </div>

        {/* Przełącznik widoków */}
        <div className="flex bg-[var(--bg-subtle)] p-[2px] sm:p-[3px] rounded-lg border border-[var(--border-subtle)] shrink-0">
          {([
            { mode: 'list' as ViewMode, icon: List, label: 'Lista' },
            { mode: 'cards' as ViewMode, icon: LayoutGrid, label: 'Karty' },
            { mode: 'calendar' as ViewMode, icon: CalendarIcon, label: 'Kalendarz' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-[5px] rounded-md text-[11px] font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              title={label}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Przyciski akcji */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenStats}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
            title="Raport i diagnostyka"
          >
            <BarChart3 className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
            title="Ustawienia, motywy i szablony"
          >
            <Settings2 className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" />
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
            title="Eksport i import"
          >
            <Share2 className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" />
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition"
            title="Drukuj A4"
          >
            <Printer className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" />
          </button>

          <button
            type="button"
            onClick={onAddDay}
            className="h-7 sm:h-8 px-2 sm:px-2.5 flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition shadow-sm"
            title="Dodaj dzień"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dzień</span>
          </button>
        </div>

      </div>
    </header>
  );
};
