import React, { useState, useRef, useEffect } from 'react';
import { TrainingProgram, DayPlan } from '../types/planner';
import { DayCard } from './DayCard';
import { Plus, ChevronDown, Check, Columns3 } from 'lucide-react';

interface CycleViewProps {
  program: TrainingProgram;
  onEditDay: (day: DayPlan) => void;
  onToggleRest: (dayId: string) => void;
  onDuplicateDay: (dayId: string) => void;
  onDeleteDay: (dayId: string) => void;
  onAddDay: () => void;
  onDuplicateLastWeek: () => void;
  onReorderDays: (fromIndex: number, toIndex: number) => void;
}

interface CardDragTarget {
  index: number;
  position: 'left' | 'right';
}

const STORAGE_COLS_KEY = 'training_planner_cycle_cols_v1';

const getScreenMaxCols = () => {
  if (typeof window === 'undefined') return 7;
  const w = window.innerWidth;
  if (w < 640) return 2;   // telefon (< 640px): maks 2 kolumny
  if (w < 768) return 3;   // mały tablet (< 768px): maks 3 kolumny
  if (w < 1024) return 5;  // tablet (< 1024px): maks 5 kolumn
  return 7;                // desktop (>= 1024px): maks 7 kolumn
};

export const CycleView: React.FC<CycleViewProps> = ({
  program,
  onEditDay,
  onToggleRest,
  onDuplicateDay,
  onDeleteDay,
  onAddDay,
  onDuplicateLastWeek,
  onReorderDays
}) => {
  const [maxCols, setMaxCols] = useState<number>(getScreenMaxCols);

  useEffect(() => {
    const handleResize = () => {
      setMaxCols(getScreenMaxCols());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [columns, setColumns] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COLS_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (val >= 1 && val <= 7) return val;
      }
    } catch { /* noop */ }
    return 7; // Domyślnie 7 kolumn (układ tygodniowy)
  });

  const effectiveCols = Math.min(columns, maxCols);
  const availableCols = Array.from({ length: maxCols }, (_, i) => i + 1);

  const [isColsDropdownOpen, setIsColsDropdownOpen] = useState(false);
  const colsDropdownRef = useRef<HTMLDivElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragTarget, setDragTarget] = useState<CardDragTarget | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (colsDropdownRef.current && !colsDropdownRef.current.contains(e.target as Node)) {
        setIsColsDropdownOpen(false);
      }
    };
    if (isColsDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isColsDropdownOpen]);

  const handleColumnChange = (num: number) => {
    setColumns(num);
    try {
      localStorage.setItem(STORAGE_COLS_KEY, String(num));
    } catch { /* noop */ }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const position: 'left' | 'right' = e.clientX < midpoint ? 'left' : 'right';

    if (!dragTarget || dragTarget.index !== index || dragTarget.position !== position) {
      setDragTarget({ index, position });
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const from = draggedIndex;
    const position = dragTarget?.position ?? 'left';
    let target = position === 'left' ? index : index + 1;
    if (from < target) target -= 1;

    if (from !== target) {
      onReorderDays(from, target);
    }

    setDraggedIndex(null);
    setDragTarget(null);
  };

  const getGridClasses = (cols: number) => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 min-[340px]:grid-cols-2';
      case 3: return 'grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3';
      case 4: return 'grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case 5: return 'grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6: return 'grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      case 7: default: return 'grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7';
    }
  };

  return (
    <div className="space-y-4">
      {/* Pasek kontrolny */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest">
            Karty · {program.days.length} dni
          </span>

          <span className="text-[var(--text-faint)] font-mono text-[10px]">·</span>

          {/* Rozwijane menu wyboru liczby kolumn */}
          <div className="relative" ref={colsDropdownRef}>
            <button
              type="button"
              onClick={() => setIsColsDropdownOpen(!isColsDropdownOpen)}
              className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-lg hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors"
              title="Zmień liczbę kolumn"
            >
              <Columns3 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="font-mono tabular-nums">
                {effectiveCols} {effectiveCols === 1 ? 'kolumna' : effectiveCols <= 4 ? 'kolumny' : 'kolumn'}
              </span>
              <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-150 ${isColsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isColsDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-xl p-1 z-30">
                <div className="px-2 py-1 text-[9.5px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)] mb-1">
                  Układ kolumn {maxCols < 7 && `(ekran: maks. ${maxCols})`}
                </div>
                {availableCols.map((num) => {
                  const isActive = effectiveCols === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        handleColumnChange(num);
                        setIsColsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors text-left ${
                        isActive
                          ? 'text-[var(--accent)] font-semibold bg-[var(--accent-subtle)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono font-medium">{num}</span>
                        <span>{num === 1 ? 'kolumna' : num <= 4 ? 'kolumny' : 'kolumn'}</span>
                        {num === 7 && <span className="text-[10px] text-[var(--text-muted)]">(tydzień)</span>}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDuplicateLastWeek}
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition px-2.5 py-1 rounded-lg hover:bg-[var(--bg-hover)]"
        >
          + Powiel tydzień
        </button>
      </div>

      {/* Dynamiczna siatka kart */}
      <div className={`grid ${getGridClasses(effectiveCols)} gap-2`}>
        {program.days.map((day, idx) => (
          <DayCard
            key={day.id}
            day={day}
            index={idx}
            isDragging={draggedIndex === idx}
            dropIndicator={
              dragTarget?.index === idx && draggedIndex !== idx ? dragTarget.position : null
            }
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onEdit={onEditDay}
            onToggleRest={onToggleRest}
            onDuplicate={onDuplicateDay}
            onDelete={onDeleteDay}
          />
        ))}

        <button
          type="button"
          onClick={onAddDay}
          className="min-h-[110px] rounded-xl border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-transparent hover:bg-[var(--bg-hover)] transition flex items-center justify-center text-[var(--text-faint)] hover:text-[var(--text-secondary)]"
          title="Dodaj kolejny dzień"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
