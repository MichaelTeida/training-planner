import React, { useState } from 'react';
import { TrainingProgram, DayPlan } from '../types/planner';
import { ChevronLeft, ChevronRight, Coffee, CalendarDays } from 'lucide-react';

interface CalendarMonthViewProps {
  program: TrainingProgram;
  onEditDay: (day: DayPlan) => void;
  onAddDayWithDate: (dateStr: string) => void;
}

const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const WKDAYS = [
  { short: 'Pn', full: 'Poniedziałek' },
  { short: 'Wt', full: 'Wtorek' },
  { short: 'Śr', full: 'Środa' },
  { short: 'Cz', full: 'Czwartek' },
  { short: 'Pt', full: 'Piątek' },
  { short: 'So', full: 'Sobota' },
  { short: 'Nd', full: 'Niedziela' },
];

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  program,
  onEditDay,
  onAddDayWithDate
}) => {
  const init = program.startDate ? new Date(program.startDate) : new Date();
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());
  const [showNextMonth, setShowNextMonth] = useState<boolean>(() => {
    try {
      return localStorage.getItem('training_planner_show_next_month_v1') === 'true';
    } catch { return false; }
  });

  const toggleNextMonth = () => {
    const next = !showNextMonth;
    setShowNextMonth(next);
    try {
      localStorage.setItem('training_planner_show_next_month_v1', String(next));
    } catch { /* noop */ }
  };

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const dayMap = new Map<string, DayPlan>();
  program.days.forEach((d) => dayMap.set(d.date, d));

  const todayStr = new Date().toISOString().split('T')[0];

  // Generowanie komórek dla wybranego miesiąca
  const generateMonthCells = (y: number, m: number) => {
    const daysInM = new Date(y, m + 1, 0).getDate();
    const firstWk = (new Date(y, m, 1).getDay() + 6) % 7;
    const cells: ({ dayNum: number; dateStr: string } | null)[] = [];
    for (let i = 0; i < firstWk; i++) cells.push(null);
    for (let d = 1; d <= daysInM; d++) {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      cells.push({ dayNum: d, dateStr: `${y}-${mm}-${dd}` });
    }
    return cells;
  };

  const currentCells = generateMonthCells(year, month);

  // Kolejny miesiąc do opcjonalnego podglądu
  const nextM = month === 11 ? 0 : month + 1;
  const nextY = month === 11 ? year + 1 : year;
  const nextCells = showNextMonth ? generateMonthCells(nextY, nextM) : [];

  const renderGrid = (cells: ({ dayNum: number; dateStr: string } | null)[], isDimmed = false) => (
    <div className={`rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-elevated)] shadow-sm transition-opacity ${isDimmed ? 'opacity-50 hover:opacity-95' : ''}`}>
      <div className="grid grid-cols-7 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-soft)]">
        {WKDAYS.map((w) => (
          <div key={w.short} className="py-1.5 sm:py-2 text-center text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            <span className="hidden md:inline">{w.full}</span>
            <span className="inline md:hidden">{w.short}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--border-subtle)]">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`e-${idx}`} className="bg-[var(--bg-base)] min-h-[64px] sm:min-h-[96px]" />;

          const plan = dayMap.get(cell.dateStr);
          const isToday = cell.dateStr === todayStr;

          return (
            <div
              key={cell.dateStr}
              onClick={() => plan ? onEditDay(plan) : onAddDayWithDate(cell.dateStr)}
              className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] min-h-[64px] sm:min-h-[96px] p-1 sm:p-2 flex flex-col cursor-pointer transition group"
            >
              {/* Wiersz numeru dnia */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] sm:text-[11px] font-mono tabular-nums px-0.5 sm:px-1 rounded ${
                  isToday
                    ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                    : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                }`}>
                  {cell.dayNum}
                </span>
                {plan && (
                  <span className="text-[8.5px] sm:text-[9px] font-mono text-[var(--text-faint)] tabular-nums font-semibold">
                    D{String(plan.dayNumber).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Cele sesji */}
              {plan ? (
                <div className="flex-1 flex flex-col justify-start overflow-hidden">
                  {plan.isRestDay ? (
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-[var(--text-faint)] mt-1">
                      <Coffee className="w-3 h-3 sm:w-2.5 sm:h-2.5 shrink-0" />
                      <span className="hidden sm:inline text-[10px]">Regeneracja</span>
                    </div>
                  ) : (
                    <>
                      {/* Wersja mobilna (< 640px): kompaktowe mikro-wskaźniki */}
                      <div className="flex flex-col sm:hidden gap-1 items-center justify-center py-1 min-w-0">
                        {plan.priorities[0] && (
                          <div className="w-full text-center text-[8.5px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] rounded px-0.5 py-[1px] truncate">
                            {plan.priorities[0]}
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {plan.priorities.slice(1).map((_, pIdx) => (
                            <span key={pIdx} className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-60" />
                          ))}
                        </div>
                        {plan.exercises.length > 0 && (
                          <span className="text-[8px] font-mono text-[var(--text-faint)]">
                            {plan.exercises.length}ćw
                          </span>
                        )}
                      </div>

                      {/* Wersja tablet / desktop (sm:): pełne etykiety tekstowe */}
                      <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
                        {plan.priorities.map((p, pIdx) => {
                          const isPrimary = pIdx === 0;
                          return (
                            <div
                              key={pIdx}
                              className={`text-[10px] truncate leading-tight flex items-center gap-1 ${
                                isPrimary
                                  ? 'font-semibold text-[var(--accent)]'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                            >
                              <span className={`w-1 h-1 rounded-full shrink-0 ${isPrimary ? 'bg-[var(--accent)]' : 'bg-current opacity-30'}`} />
                              <span className="truncate">{p}</span>
                            </div>
                          );
                        })}

                        {plan.exercises.length > 0 && (
                          <div className="text-[9px] font-mono text-[var(--text-faint)] mt-1">
                            {plan.exercises.length} ćw.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-[10px] text-[var(--text-faint)]">+</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pasek kontrolny */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[12px] sm:text-[13px] font-semibold text-[var(--text-primary)]">
            {MONTHS[month]} {year}
          </span>
          <div className="flex items-center gap-0.5 ml-1 sm:ml-2">
            <button type="button" onClick={prev} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition" title="Poprzedni miesiąc">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { const n = new Date(); setMonth(n.getMonth()); setYear(n.getFullYear()); }}
              className="px-2 py-0.5 text-[10.5px] sm:text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded hover:bg-[var(--bg-hover)] transition"
            >
              Dziś
            </button>
            <button type="button" onClick={next} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition" title="Następny miesiąc">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Opcjonalny przełącznik podglądu kolejnego miesiąca */}
        <button
          type="button"
          onClick={toggleNextMonth}
          className={`text-[10.5px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showNextMonth
              ? 'bg-[var(--accent-subtle)] border-[var(--accent-border)] text-[var(--accent)]'
              : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
          title="Włącz lub wyłącz przyciemniony podgląd kolejnego miesiąca"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Podgląd kolejnego miesiąca</span>
          <span className="inline xs:hidden">+1 Miesiąc</span>
          <span className={`w-1.5 h-1.5 rounded-full transition-colors ${showNextMonth ? 'bg-[var(--accent)]' : 'bg-[var(--text-faint)]'}`} />
        </button>
      </div>

      {/* Siatka bieżącego miesiąca */}
      {renderGrid(currentCells, false)}

      {/* Przyciemniony podgląd kolejnego miesiąca (jeśli włączony) */}
      {showNextMonth && (
        <div className="space-y-3 pt-3 border-t border-dashed border-[var(--border-subtle)] animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-60" />
              Kolejny miesiąc: {MONTHS[nextM]} {nextY}
              <span className="text-[10px] font-normal text-[var(--text-faint)]">(przyciemniony podgląd)</span>
            </span>
          </div>
          {renderGrid(nextCells, true)}
        </div>
      )}
    </div>
  );
};
