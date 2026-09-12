import React, { useState } from 'react';
import { TrainingProgram, DayPlan } from '../types/planner';
import { getDayOfWeekName, formatDateCompact } from '../utils/exportFormats';
import { Plus, Copy, Trash2, Edit2, Coffee, GripVertical } from 'lucide-react';

interface ListViewProps {
  program: TrainingProgram;
  onEditDay: (day: DayPlan) => void;
  onToggleRest: (dayId: string) => void;
  onDuplicateDay: (dayId: string) => void;
  onDeleteDay: (dayId: string) => void;
  onAddDay: () => void;
  onDuplicateLastWeek: () => void;
  onReorderDays: (fromIndex: number, toIndex: number) => void;
}

interface DragTargetState {
  index: number;
  position: 'top' | 'bottom';
}

export const ListView: React.FC<ListViewProps> = ({
  program,
  onEditDay,
  onToggleRest,
  onDuplicateDay,
  onDeleteDay,
  onAddDay,
  onDuplicateLastWeek,
  onReorderDays
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragTarget, setDragTarget] = useState<DragTargetState | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: 'top' | 'bottom' = e.clientY < midpoint ? 'top' : 'bottom';

    if (!dragTarget || dragTarget.index !== idx || dragTarget.position !== position) {
      setDragTarget({ index: idx, position });
    }
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const from = draggedIndex;
    const position = dragTarget?.position ?? 'top';
    let target = position === 'top' ? idx : idx + 1;
    if (from < target) target -= 1;

    if (from !== target) {
      onReorderDays(from, target);
    }

    setDraggedIndex(null);
    setDragTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest">
          Harmonogram · {program.days.length} dni
        </span>
        <button
          type="button"
          onClick={onDuplicateLastWeek}
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition px-2.5 py-1 rounded-lg hover:bg-[var(--bg-hover)]"
        >
          + Powiel tydzień
        </button>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-elevated)] shadow-sm">
        {/* Nagłówek kolumn (widoczny na tabletach i desktopie) */}
        <div className="hidden sm:grid sm:grid-cols-[56px_140px_80px_1fr_80px] items-center h-8 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
          <span>#</span>
          <span>Dzień</span>
          <span>Status</span>
          <span>Cele sesji</span>
          <span className="text-right">Akcje</span>
        </div>

        {program.days.map((day, idx) => {
          const dayOfWeek = getDayOfWeekName(day.date, true);
          const dateFormatted = formatDateCompact(day.date);
          const p1 = day.priorities[0];
          const secondary = day.priorities.slice(1);
          const isEven = idx % 2 === 0;
          const isBeingDragged = draggedIndex === idx;
          const isOverThis = dragTarget?.index === idx && draggedIndex !== idx;

          return (
            <div
              key={day.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => onEditDay(day)}
              className={`group relative p-3 sm:px-4 sm:py-0 sm:h-10 cursor-pointer transition-colors border-b border-[var(--border-subtle)] last:border-b-0 ${
                isBeingDragged
                  ? 'opacity-25 bg-[var(--bg-surface-soft)]'
                  : isEven
                  ? 'bg-transparent'
                  : 'bg-[var(--bg-surface-soft)]'
              } hover:bg-[var(--bg-hover)]`}
            >
              {/* Wskaźnik linii upuszczenia */}
              {isOverThis && dragTarget.position === 'top' && (
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] pointer-events-none" />
              )}
              {isOverThis && dragTarget.position === 'bottom' && (
                <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] pointer-events-none" />
              )}

              {/* 1. UKŁAD DESKTOP / TABLET (sm:grid) */}
              <div className="hidden sm:grid sm:grid-cols-[56px_140px_80px_1fr_80px] items-center h-full">
                {/* Drag Handle & # */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-[var(--text-faint)] group-hover:text-[var(--text-muted)] cursor-grab active:cursor-grabbing shrink-0 transition" />
                  <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] font-medium">
                    {String(day.dayNumber).padStart(2, '0')}
                  </span>
                </div>

                {/* Dzień i data */}
                <div className="flex items-baseline gap-2 min-w-0 pr-2">
                  <span className={`text-[12px] font-medium leading-none truncate ${
                    day.isRestDay ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {dayOfWeek}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-[var(--text-faint)] shrink-0">
                    {dateFormatted}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleRest(day.id); }}
                    className={`w-[58px] text-center text-[10px] font-medium py-[2px] rounded-full border transition-colors ${
                      day.isRestDay
                        ? 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border-transparent'
                        : 'text-[var(--accent)] bg-[var(--accent-subtle)] border-[var(--accent-border)]'
                    } hover:opacity-80`}
                  >
                    {day.isRestDay ? 'Rest' : 'Trening'}
                  </button>
                </div>

                {/* Cele */}
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  {day.isRestDay ? (
                    <span className="text-[11px] text-[var(--text-faint)] flex items-center gap-1.5">
                      <Coffee className="w-3 h-3" />
                      Regeneracja
                    </span>
                  ) : (
                    <>
                      {p1 ? (
                        <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-2 py-[1px] rounded shrink-0">
                          {p1}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-faint)] italic">—</span>
                      )}

                      {secondary.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-tag)] px-1.5 py-[1px] rounded shrink-0"
                        >
                          {tag}
                        </span>
                      ))}

                      {day.exercises.length > 0 && (
                        <span className="text-[10px] text-[var(--text-faint)] font-mono ml-1 shrink-0">
                          {day.exercises.length} ćw.
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Akcje */}
                <div
                  className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button type="button" onClick={() => onEditDay(day)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition" title="Edytuj">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => onDuplicateDay(day.id)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition" title="Powiel">
                    <Copy className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => onDeleteDay(day.id)} className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] rounded transition" title="Usuń">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 2. UKŁAD MOBILNY (< 640px) */}
              <div className="flex flex-col gap-1.5 sm:hidden">
                {/* Wiersz 1: Grip + Numer + Dzień/Data + Status + Akcje */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-[var(--text-faint)] shrink-0" />
                    <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] font-semibold shrink-0">
                      D{String(day.dayNumber).padStart(2, '0')}
                    </span>
                    <span className={`text-[12px] font-semibold truncate ${
                      day.isRestDay ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                    }`}>
                      {dayOfWeek.slice(0, 2)}, {dateFormatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleRest(day.id)}
                      className={`w-[54px] text-center text-[9.5px] font-semibold py-0.5 rounded-full border transition-colors ${
                        day.isRestDay
                          ? 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border-transparent'
                          : 'text-[var(--accent)] bg-[var(--accent-subtle)] border-[var(--accent-border)]'
                      }`}
                    >
                      {day.isRestDay ? 'Rest' : 'Trening'}
                    </button>
                    <button type="button" onClick={() => onEditDay(day)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="Edytuj">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDuplicateDay(day.id)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" title="Powiel">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDeleteDay(day.id)} className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] rounded" title="Usuń">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Wiersz 2: Cele sesji lub informacja o odpoczynku */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pl-5">
                  {day.isRestDay ? (
                    <span className="text-[10.5px] text-[var(--text-faint)] flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> Regeneracja
                    </span>
                  ) : (
                    <>
                      {p1 && (
                        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-1.5 py-0.5 rounded shrink-0">
                          {p1}
                        </span>
                      )}
                      {secondary.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-tag)] px-1.5 py-0.5 rounded shrink-0"
                        >
                          {tag}
                        </span>
                      ))}
                      {day.exercises.length > 0 && (
                        <span className="text-[9.5px] text-[var(--text-faint)] font-mono ml-auto shrink-0">
                          {day.exercises.length} ćw.
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAddDay}
        className="w-full h-9 border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-transparent hover:bg-[var(--bg-hover)] text-[11px] text-[var(--text-faint)] hover:text-[var(--text-secondary)] rounded-xl transition flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Dodaj dzień
      </button>
    </div>
  );
};
