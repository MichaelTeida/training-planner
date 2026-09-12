import React, { useState, useEffect, useRef } from 'react';
import { DayPlan, ExerciseItem } from '../types/planner';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { getDayOfWeekName, formatDateCompact } from '../utils/exportFormats';

interface DayEditorModalProps {
  day: DayPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDay: DayPlan) => void;
}

interface TagDragTarget {
  index: number;
  position: 'top' | 'bottom';
}

interface ExDragTarget {
  index: number;
  position: 'top' | 'bottom';
}

const PRESETS = ['Klatka', 'Martwy ciąg', 'Przysiad', 'OHP', 'Plecy', 'Barki', 'Triceps', 'Biceps', 'Brzuch', 'Nogi', 'Łydki'];

export const DayEditorModal: React.FC<DayEditorModalProps> = ({
  day,
  isOpen,
  onClose,
  onSave
}) => {
  const [edited, setEdited] = useState<DayPlan | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [draggedTagIdx, setDraggedTagIdx] = useState<number | null>(null);
  const [tagDragTarget, setTagDragTarget] = useState<TagDragTarget | null>(null);
  const [draggedExIdx, setDraggedExIdx] = useState<number | null>(null);
  const [exDragTarget, setExDragTarget] = useState<ExDragTarget | null>(null);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (day) {
      setEdited(JSON.parse(JSON.stringify(day)));
      setCustomInput('');
      setDraggedTagIdx(null);
      setTagDragTarget(null);
      setDraggedExIdx(null);
      setExDragTarget(null);
    }
  }, [day, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !edited) return null;

  const dayOfWeek = getDayOfWeekName(edited.date, true);
  const dateStr = formatDateCompact(edited.date);

  // Automatyczny zapis w czasie rzeczywistym
  const updateAndSave = (next: DayPlan) => {
    setEdited(next);
    onSave(next);
  };

  const addTag = (tag: string) => {
    const v = tag.trim();
    if (!v || edited.priorities.includes(v)) return;
    const next: DayPlan = { ...edited, priorities: [...edited.priorities, v] };
    updateAndSave(next);
    setCustomInput('');
  };

  const removeTag = (idx: number) => {
    const u = [...edited.priorities];
    u.splice(idx, 1);
    const next: DayPlan = { ...edited, priorities: u };
    updateAndSave(next);
  };

  const promoteTag = (idx: number) => {
    if (idx === 0) return;
    const u = [...edited.priorities];
    const item = u.splice(idx, 1)[0];
    u.unshift(item);
    const next: DayPlan = { ...edited, priorities: u };
    updateAndSave(next);
  };

  const handleTagDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTagIdx(idx);
  };

  const handleTagDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: 'top' | 'bottom' = e.clientY < midpoint ? 'top' : 'bottom';
    if (!tagDragTarget || tagDragTarget.index !== idx || tagDragTarget.position !== position) {
      setTagDragTarget({ index: idx, position });
    }
  };

  const handleTagDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedTagIdx === null) return;
    const from = draggedTagIdx;
    const position = tagDragTarget?.position ?? 'top';
    let target = position === 'top' ? idx : idx + 1;
    if (from < target) target -= 1;

    if (from !== target) {
      const u = [...edited.priorities];
      const [item] = u.splice(from, 1);
      u.splice(target, 0, item);
      const next: DayPlan = { ...edited, priorities: u };
      updateAndSave(next);
    }
    setDraggedTagIdx(null);
    setTagDragTarget(null);
  };

  const toggleRest = (isRestDay: boolean) => {
    const next: DayPlan = { ...edited, isRestDay };
    updateAndSave(next);
  };

  const addExercise = () => {
    const next: DayPlan = {
      ...edited,
      exercises: [...edited.exercises, { id: `e-${Date.now().toString(36)}`, name: '', sets: '', weightOrRpe: '' }]
    };
    updateAndSave(next);
  };

  const updateExercise = (i: number, field: keyof ExerciseItem, value: string) => {
    const u = [...edited.exercises];
    u[i] = { ...u[i], [field]: value };
    const next: DayPlan = { ...edited, exercises: u };
    updateAndSave(next);
  };

  const removeExercise = (i: number) => {
    const u = [...edited.exercises];
    u.splice(i, 1);
    const next: DayPlan = { ...edited, exercises: u };
    updateAndSave(next);
  };

  const handleExDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedExIdx(idx);
  };

  const handleExDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: 'top' | 'bottom' = e.clientY < midpoint ? 'top' : 'bottom';
    if (!exDragTarget || exDragTarget.index !== idx || exDragTarget.position !== position) {
      setExDragTarget({ index: idx, position });
    }
  };

  const handleExDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedExIdx === null) return;
    const from = draggedExIdx;
    const position = exDragTarget?.position ?? 'top';
    let target = position === 'top' ? idx : idx + 1;
    if (from < target) target -= 1;

    if (from !== target) {
      const u = [...edited.exercises];
      const [item] = u.splice(from, 1);
      u.splice(target, 0, item);
      const next: DayPlan = { ...edited, exercises: u };
      updateAndSave(next);
    }
    setDraggedExIdx(null);
    setExDragTarget(null);
  };

  const handleNotesChange = (val: string) => {
    const next: DayPlan = { ...edited, notes: val };
    updateAndSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-start justify-center p-2.5 sm:px-4 sm:pt-[6vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[82vh]" onClick={(e) => e.stopPropagation()}>

        {/* Nagłówek */}
        <div className="flex items-center justify-between h-12 px-4 sm:px-5 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="text-[11px] font-mono tabular-nums font-semibold text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded">
              D{String(edited.dayNumber).padStart(2, '0')}
            </span>
            <span className="text-[12.5px] sm:text-[13px] font-semibold text-[var(--text-primary)]">{dayOfWeek}</span>
            <span className="text-[10.5px] sm:text-[11px] font-mono text-[var(--text-faint)] tabular-nums">{dateStr}</span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-3.5 sm:p-5 space-y-4 sm:space-y-5">

          {/* Typ dnia */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Status dnia</span>
            <div className="flex bg-[var(--bg-subtle)] p-[2px] rounded-lg border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => toggleRest(false)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  !edited.isRestDay
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-border)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Trening
              </button>
              <button
                type="button"
                onClick={() => toggleRest(true)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  edited.isRestDay
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-subtle)] shadow-sm'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Odpoczynek
              </button>
            </div>
          </div>

          {!edited.isRestDay && (
            <>
              {/* SEKCJA 1: Cele sesji */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Cele sesji</span>
                  <span className="text-[10px] text-[var(--text-faint)]">Pozycja #1 = czerwony priorytet</span>
                </div>

                {/* Przypisane cele z drag & drop */}
                {edited.priorities.length > 0 && (
                  <div className="space-y-1">
                    {edited.priorities.map((p, idx) => {
                      const isPrimary = idx === 0;
                      const isBeingDragged = draggedTagIdx === idx;
                      const isTarget = tagDragTarget?.index === idx && draggedTagIdx !== idx;

                      return (
                        <div
                          key={`${p}-${idx}`}
                          draggable
                          onDragStart={(e) => handleTagDragStart(e, idx)}
                          onDragOver={(e) => handleTagDragOver(e, idx)}
                          onDrop={(e) => handleTagDrop(e, idx)}
                          onDragEnd={() => { setDraggedTagIdx(null); setTagDragTarget(null); }}
                          className={`group/tag relative flex items-center h-8 rounded-lg border transition ${
                            isBeingDragged
                              ? 'opacity-20'
                              : isPrimary
                              ? 'bg-[var(--accent-subtle)] border-[var(--accent-border)]'
                              : 'bg-[var(--bg-surface-soft)] border-[var(--border-subtle)]'
                          }`}
                        >
                          {/* Wskaźnik linii upuszczenia */}
                          {isTarget && tagDragTarget.position === 'top' && (
                            <div className="absolute left-0 right-0 top-0 h-[2px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] pointer-events-none" />
                          )}
                          {isTarget && tagDragTarget.position === 'bottom' && (
                            <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] pointer-events-none" />
                          )}

                          <button
                            type="button"
                            onClick={() => promoteTag(idx)}
                            className={`w-8 h-full flex items-center justify-center shrink-0 rounded-l-lg cursor-grab active:cursor-grabbing transition ${
                              isPrimary ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-secondary)]'
                            }`}
                            title={isPrimary ? 'Główny priorytet' : 'Ustaw na górze jako priorytet #1'}
                          >
                            {isPrimary ? (
                              <span className="text-[9px] font-bold font-mono">#1</span>
                            ) : (
                              <GripVertical className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <span className={`flex-1 text-[12px] truncate select-none ${
                            isPrimary ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-primary)]'
                          }`}>
                            {p}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="w-8 h-full flex items-center justify-center shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover/tag:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Szybki wybór */}
                <div className="flex flex-wrap gap-1">
                  {PRESETS.filter((t) => !edited.priorities.includes(t)).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTag(t)}
                      className="text-[10.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-tag)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] px-2 py-[3px] rounded-md transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Własny cel */}
                <div className="flex gap-1.5">
                  <input
                    ref={customRef}
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(customInput); } }}
                    placeholder="Wpisz własny cel…"
                    className="flex-1 h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--border-default)] transition"
                  />
                  <button
                    type="button"
                    onClick={() => { addTag(customInput); customRef.current?.focus(); }}
                    className="h-8 px-3 text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-lg transition"
                  >
                    Dodaj
                  </button>
                </div>
              </div>

              {/* SEKCJA 2: Ćwiczenia */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Ćwiczenia</span>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:opacity-80 font-medium transition"
                  >
                    <Plus className="w-3 h-3" />
                    Dodaj
                  </button>
                </div>

                {edited.exercises.length > 0 ? (
                  <div className="space-y-1.5">
                    {/* Nagłówki kolumn ćwiczeń */}
                    <div className="grid grid-cols-[18px_1fr_56px_68px_24px] sm:grid-cols-[20px_1fr_72px_80px_28px] gap-1 sm:gap-1.5 text-[9.5px] sm:text-[10px] text-[var(--text-faint)] font-medium px-0.5 items-center">
                      <span></span>
                      <span>Nazwa</span>
                      <span className="text-center">Serie</span>
                      <span className="text-center">Ciężar/RPE</span>
                      <span></span>
                    </div>

                    {edited.exercises.map((ex, idx) => {
                      const isBeingDragged = draggedExIdx === idx;
                      const isTarget = exDragTarget?.index === idx && draggedExIdx !== idx;

                      return (
                        <div
                          key={ex.id}
                          draggable
                          onDragStart={(e) => handleExDragStart(e, idx)}
                          onDragOver={(e) => handleExDragOver(e, idx)}
                          onDrop={(e) => handleExDrop(e, idx)}
                          onDragEnd={() => { setDraggedExIdx(null); setExDragTarget(null); }}
                          className={`relative grid grid-cols-[18px_1fr_56px_68px_24px] sm:grid-cols-[20px_1fr_72px_80px_28px] gap-1 sm:gap-1.5 items-center transition ${
                            isBeingDragged ? 'opacity-20' : ''
                          }`}
                        >
                          {/* Wskaźnik linii upuszczenia ćwiczenia */}
                          {isTarget && exDragTarget.position === 'top' && (
                            <div className="absolute left-0 right-0 top-0 h-[2px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] pointer-events-none" />
                          )}
                          {isTarget && exDragTarget.position === 'bottom' && (
                            <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--accent)] z-20 shadow-[0_0_8px_var(--accent-glow)] pointer-events-none" />
                          )}

                          <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-[var(--text-faint)] hover:text-[var(--text-muted)] transition">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                            placeholder="Wyciskanie"
                            className="h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2 sm:px-2.5 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--border-default)] transition min-w-0"
                          />
                          <input
                            type="text"
                            value={ex.sets}
                            onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                            placeholder="5×5"
                            className="h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-1 sm:px-2 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--border-default)] transition font-mono text-center min-w-0"
                          />
                          <input
                            type="text"
                            value={ex.weightOrRpe || ''}
                            onChange={(e) => updateExercise(idx, 'weightOrRpe', e.target.value)}
                            placeholder="140kg"
                            className="h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-1 sm:px-2 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--border-default)] transition font-mono text-center min-w-0"
                          />
                          <button
                            type="button"
                            onClick={() => removeExercise(idx)}
                            className="h-8 w-6 sm:w-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] rounded transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={addExercise}
                    className="w-full h-9 border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-lg text-[11px] text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition"
                  >
                    Kliknij, aby dodać ćwiczenie do sesji
                  </button>
                )}
              </div>
            </>
          )}

          {/* Notatka */}
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <input
              type="text"
              value={edited.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Notatka trenerska (opcjonalna)…"
              className="w-full h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--border-default)] transition"
            />
          </div>

        </div>

        {/* Stopka */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[var(--border-subtle)]">
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
