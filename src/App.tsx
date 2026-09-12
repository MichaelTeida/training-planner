import React, { useState, useEffect } from 'react';
import { TrainingProgram, DayPlan, ViewMode } from './types/planner';
import { ThemeId, getStoredTheme, saveTheme } from './types/theme';
import {
  loadProgram,
  saveProgram,
  createEmptyProgram,
  addDaysToDate
} from './storage/localStore';
import { Header } from './components/Header';
import { ListView } from './components/ListView';
import { CycleView } from './components/CycleView';
import { CalendarMonthView } from './components/CalendarMonthView';
import { DayEditorModal } from './components/DayEditorModal';
import { ExportModal } from './components/ExportModal';
import { PrintSheet } from './components/PrintSheet';
import { PrintConfigModal } from './components/PrintConfigModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintConfig, DEFAULT_PRINT_CONFIG } from './types/printConfig';
import { StatsPanel } from './components/StatsPanel';
import { ConfirmModal } from './components/ConfirmModal';
import { TEMPLATES } from './storage/templates';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeId>(() => getStoredTheme());
  const [program, setProgram] = useState<TrainingProgram>(() => loadProgram());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingDay, setEditingDay] = useState<DayPlan | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPrintConfigOpen, setIsPrintConfigOpen] = useState<boolean>(false);
  const [printConfig, setPrintConfig] = useState<PrintConfig>(DEFAULT_PRINT_CONFIG);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveProgram(program);
  }, [program]);

  const handleUpdateTotalDays = (count: number) => {
    if (count < 1) return;
    const currentDays = [...program.days];
    
    if (count > currentDays.length) {
      for (let i = currentDays.length; i < count; i++) {
        currentDays.push({
          id: `day-${i + 1}-${Date.now().toString(36)}-${i}`,
          dayNumber: i + 1,
          date: addDaysToDate(program.startDate, i),
          isRestDay: false,
          priorities: [],
          exercises: []
        });
      }
    } else if (count < currentDays.length) {
      currentDays.splice(count);
    }

    setProgram({
      ...program,
      totalDays: count,
      days: currentDays
    });
  };

  const handleUpdateStartDate = (newStartDate: string) => {
    const updatedDays = program.days.map((day, idx) => ({
      ...day,
      date: addDaysToDate(newStartDate, idx)
    }));
    setProgram({
      ...program,
      startDate: newStartDate,
      days: updatedDays
    });
  };

  const handleUpdateTitle = (title: string) => {
    setProgram({ ...program, title });
  };

  const handleAddDay = () => {
    const newDayNum = program.days.length + 1;
    const newDay: DayPlan = {
      id: `day-${newDayNum}-${Date.now().toString(36)}`,
      dayNumber: newDayNum,
      date: addDaysToDate(program.startDate, newDayNum - 1),
      isRestDay: false,
      priorities: [],
      exercises: []
    };
    setProgram({
      ...program,
      totalDays: newDayNum,
      days: [...program.days, newDay]
    });
  };

  const handleAddDayWithDate = (dateStr: string) => {
    const newDayNum = program.days.length + 1;
    const newDay: DayPlan = {
      id: `day-${newDayNum}-${Date.now().toString(36)}`,
      dayNumber: newDayNum,
      date: dateStr,
      isRestDay: false,
      priorities: [],
      exercises: []
    };
    setProgram({
      ...program,
      totalDays: newDayNum,
      days: [...program.days, newDay]
    });
  };

  const handleDuplicateLastWeek = () => {
    if (program.days.length === 0) return;
    const countToClone = Math.min(7, program.days.length);
    const slice = program.days.slice(-countToClone);
    const newDays = [...program.days];
    let startDayNum = program.days.length + 1;

    slice.forEach((dayToClone, idx) => {
      newDays.push({
        ...dayToClone,
        id: `day-${startDayNum}-${Date.now().toString(36)}-${idx}`,
        dayNumber: startDayNum,
        date: addDaysToDate(program.startDate, startDayNum - 1),
        priorities: [...dayToClone.priorities],
        exercises: JSON.parse(JSON.stringify(dayToClone.exercises))
      });
      startDayNum++;
    });

    setProgram({
      ...program,
      totalDays: newDays.length,
      days: newDays
    });
  };

  const handleDuplicateDay = (dayId: string) => {
    const index = program.days.findIndex((d) => d.id === dayId);
    if (index === -1) return;
    const target = program.days[index];
    const newDay: DayPlan = {
      ...target,
      id: `day-${Date.now().toString(36)}`,
      dayNumber: index + 2,
      priorities: [...target.priorities],
      exercises: JSON.parse(JSON.stringify(target.exercises))
    };

    const updated = [...program.days];
    updated.splice(index + 1, 0, newDay);

    const reindexed = updated.map((d, i) => ({
      ...d,
      dayNumber: i + 1,
      date: addDaysToDate(program.startDate, i)
    }));

    setProgram({
      ...program,
      totalDays: reindexed.length,
      days: reindexed
    });
  };

  const executeDeleteDay = (dayId: string) => {
    if (program.days.length <= 1) return;
    const updated = program.days.filter((d) => d.id !== dayId);
    const reindexed = updated.map((d, i) => ({
      ...d,
      dayNumber: i + 1,
      date: addDaysToDate(program.startDate, i)
    }));

    setProgram({
      ...program,
      totalDays: reindexed.length,
      days: reindexed
    });
  };

  const handleDeleteDay = (dayId: string) => {
    if (program.days.length <= 1) return;
    const day = program.days.find((d) => d.id === dayId);
    if (day && (day.exercises.length > 0 || day.priorities.length > 0)) {
      setConfirmState({
        isOpen: true,
        title: `Usunąć dzień ${String(day.dayNumber).padStart(2, '0')}?`,
        message: 'Ten dzień zawiera przypisane cele lub ćwiczenia. Nastąpi usunięcie i przenumerowanie kolejnych dni.',
        confirmLabel: 'Usuń dzień',
        isDestructive: true,
        onConfirm: () => executeDeleteDay(dayId)
      });
      return;
    }
    executeDeleteDay(dayId);
  };

  const handleToggleRest = (dayId: string) => {
    const updated = program.days.map((day) => {
      if (day.id === dayId) {
        return { ...day, isRestDay: !day.isRestDay };
      }
      return day;
    });
    setProgram({ ...program, days: updated });
  };

  const handleSaveDay = (updatedDay: DayPlan) => {
    const updated = program.days.map((day) =>
      day.id === updatedDay.id ? updatedDay : day
    );
    setProgram({ ...program, days: updated });
  };

  const handlePromptReset = () => {
    setConfirmState({
      isOpen: true,
      title: 'Wyczyścić cały plan do zera?',
      message: 'Wszystkie wprowadzone dni, cele sesji oraz rozpisane ćwiczenia zostaną wyczyszczone. Otrzymasz pusty harmonogram gotowy do rozpisania od nowa.',
      confirmLabel: 'Wyczyść do zera',
      isDestructive: true,
      onConfirm: () => {
        const clean = createEmptyProgram(program.totalDays || 26, program.startDate);
        saveProgram(clean);
        setProgram(clean);
      }
    });
  };

  const handlePromptTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setConfirmState({
      isOpen: true,
      title: `Załadować: ${tpl.name}?`,
      message: 'Obecny harmonogram i wszystkie rozpisane cele zostaną zastąpione gotowym planem treningowym. Tej operacji nie można cofnąć.',
      confirmLabel: 'Załaduj szablon',
      isDestructive: false,
      onConfirm: () => {
        const loaded = tpl.create();
        saveProgram(loaded);
        setProgram(loaded);
      }
    });
  };

  const handleReorderDays = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const updated = [...program.days];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    const reindexed = updated.map((d, i) => ({
      ...d,
      dayNumber: i + 1,
      date: addDaysToDate(program.startDate, i)
    }));

    setProgram({
      ...program,
      days: reindexed
    });
  };

  const handleImportProgram = (imported: TrainingProgram) => {
    if (!imported || !Array.isArray(imported.days) || imported.days.length === 0) return;

    const normalizedDays: DayPlan[] = imported.days.map((day, idx) => ({
      id: day.id || `day-${idx + 1}-${Date.now().toString(36)}-${idx}`,
      dayNumber: typeof day.dayNumber === 'number' ? day.dayNumber : idx + 1,
      date: day.date || addDaysToDate(imported.startDate || program.startDate, idx),
      isRestDay: Boolean(day.isRestDay),
      priorities: Array.isArray(day.priorities) ? day.priorities.filter(Boolean) : [],
      exercises: Array.isArray(day.exercises)
        ? day.exercises.map((ex: any, exIdx: number) => ({
            id: ex.id || `ex-${idx}-${exIdx}`,
            name: ex.name || '',
            sets: ex.sets || '3x10',
            weightOrRpe: ex.weightOrRpe || [ex.weight, ex.rir].filter(Boolean).join(', ') || ''
          }))
        : [],
      notes: day.notes || ''
    }));

    const normalizedProgram: TrainingProgram = {
      id: imported.id || `program-${Date.now().toString(36)}`,
      title: imported.title?.trim() || 'Plan Treningowy',
      startDate: imported.startDate || program.startDate,
      totalDays: normalizedDays.length,
      days: normalizedDays,
      updatedAt: new Date().toISOString()
    };

    saveProgram(normalizedProgram);
    setProgram(normalizedProgram);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-[var(--accent-text)]">
      <Header
        program={program}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddDay={handleAddDay}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPrint={() => setIsPrintConfigOpen(true)}
        onUpdateTitle={handleUpdateTitle}
      />

      <main className="no-print flex-1 max-w-5xl w-full mx-auto px-2.5 sm:px-4 py-4 sm:py-6">
        {viewMode === 'list' && (
          <ListView
            program={program}
            onEditDay={setEditingDay}
            onToggleRest={handleToggleRest}
            onDuplicateDay={handleDuplicateDay}
            onDeleteDay={handleDeleteDay}
            onAddDay={handleAddDay}
            onDuplicateLastWeek={handleDuplicateLastWeek}
            onReorderDays={handleReorderDays}
          />
        )}

        {viewMode === 'cards' && (
          <CycleView
            program={program}
            onEditDay={setEditingDay}
            onToggleRest={handleToggleRest}
            onDuplicateDay={handleDuplicateDay}
            onDeleteDay={handleDeleteDay}
            onAddDay={handleAddDay}
            onDuplicateLastWeek={handleDuplicateLastWeek}
            onReorderDays={handleReorderDays}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarMonthView
            program={program}
            onEditDay={setEditingDay}
            onAddDayWithDate={handleAddDayWithDate}
          />
        )}
      </main>

      <DayEditorModal
        day={editingDay}
        isOpen={Boolean(editingDay)}
        onClose={() => setEditingDay(null)}
        onSave={handleSaveDay}
      />

      <ExportModal
        program={program}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onImportProgram={handleImportProgram}
      />

      <StatsPanel
        program={program}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        program={program}
        currentTheme={theme}
        onThemeChange={setTheme}
        onUpdateTotalDays={handleUpdateTotalDays}
        onUpdateStartDate={handleUpdateStartDate}
        onLoadTemplate={handlePromptTemplate}
        onResetAll={handlePromptReset}
      />

      <PrintConfigModal
        isOpen={isPrintConfigOpen}
        onClose={() => setIsPrintConfigOpen(false)}
        config={printConfig}
        onChange={setPrintConfig}
        onPrint={() => window.print()}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        isDestructive={confirmState.isDestructive}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      <PrintSheet program={program} config={printConfig} />
    </div>
  );
};

export default App;
