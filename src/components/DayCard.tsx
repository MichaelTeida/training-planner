import React from 'react';
import { DayPlan } from '../types/planner';
import { getDayOfWeekName, formatDateCompact } from '../utils/exportFormats';
import { Coffee, Copy, Trash2, GripVertical, Edit2 } from 'lucide-react';

interface DayCardProps {
  day: DayPlan;
  index: number;
  isDragging: boolean;
  dropIndicator: 'left' | 'right' | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onEdit: (day: DayPlan) => void;
  onToggleRest: (dayId: string) => void;
  onDuplicate: (dayId: string) => void;
  onDelete: (dayId: string) => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  index,
  isDragging,
  dropIndicator,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onEdit,
  onToggleRest,
  onDuplicate,
  onDelete
}) => {
  // Pełna nazwa (np. Poniedziałek) z płynnym przejściem w CSS na skrót (Pn), gdy brakuje miejsca
  const dayOfWeekFull = getDayOfWeekName(day.date, true);
  const dayOfWeekShort = getDayOfWeekName(day.date, false);
  const dateFormatted = formatDateCompact(day.date);
  const p1 = day.priorities[0];
  const secondary = day.priorities.slice(1);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={() => onEdit(day)}
      className={`day-card group relative rounded-xl p-2.5 sm:p-3 cursor-pointer transition-colors border min-h-[110px] flex flex-col ${
        isDragging
          ? 'opacity-20 scale-[0.98]'
          : day.isRestDay
          ? 'bg-[var(--bg-surface-soft)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)]'
      }`}
    >
      {/* Wskaźnik precyzyjny upuszczenia */}
      {dropIndicator === 'left' && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] rounded-l-xl pointer-events-none" />
      )}
      {dropIndicator === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] rounded-r-xl pointer-events-none" />
      )}

      {/* Nagłówek karty: D01 + Dzień tygodnia po lewej, data po prawej */}
      <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          <GripVertical className="w-3 h-3 text-[var(--text-faint)] group-hover:text-[var(--text-muted)] cursor-grab active:cursor-grabbing transition shrink-0" />
          <span className="text-[10.5px] sm:text-[11px] font-mono tabular-nums font-semibold text-[var(--text-muted)] shrink-0">
            D{String(day.dayNumber).padStart(2, '0')}
          </span>
          <span className={`text-[11px] font-medium truncate ${day.isRestDay ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
            <span className="day-name-full">{dayOfWeekFull}</span>
            <span className="day-name-short">{dayOfWeekShort}</span>
          </span>
        </div>

        <span className="text-[9.5px] sm:text-[10px] font-mono text-[var(--text-muted)] tabular-nums shrink-0 ml-1">
          {dateFormatted}
        </span>
      </div>

      {/* Treść */}
      {day.isRestDay ? (
        <div className="flex-1 flex items-center justify-center text-[10.5px] sm:text-[11px] text-[var(--text-faint)] py-2">
          Regeneracja
        </div>
      ) : (
        <div className="flex-1 space-y-1.5 min-w-0 py-0.5">
          <div className="flex flex-wrap items-center gap-1">
            {p1 ? (
              <span className="text-[10px] sm:text-[10.5px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-1.5 py-[1px] rounded truncate max-w-full">
                {p1}
              </span>
            ) : (
              <span className="text-[11px] text-[var(--text-faint)]">—</span>
            )}
            {secondary.map((s, i) => (
              <span key={i} className="text-[10px] sm:text-[10.5px] text-[var(--text-secondary)] bg-[var(--bg-tag)] px-1.5 py-[1px] rounded truncate max-w-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stopka karty: liczba ćwiczeń po lewej, micro-akcje po prawej */}
      <div className="mt-auto pt-1.5 flex items-center justify-between min-h-[22px]">
        <div className="text-[9.5px] sm:text-[10px] text-[var(--text-faint)] font-mono truncate">
          {!day.isRestDay && day.exercises.length > 0 ? `${day.exercises.length} ćw.` : ''}
        </div>

        <div
          className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onToggleRest(day.id)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded transition"
            title={day.isRestDay ? "Ustaw jako trening" : "Ustaw dzień regeneracji"}
          >
            <Coffee className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(day)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded transition"
            title="Edytuj dzień"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(day.id)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded transition"
            title="Powiel dzień"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(day.id)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)] rounded transition"
            title="Usuń dzień"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
