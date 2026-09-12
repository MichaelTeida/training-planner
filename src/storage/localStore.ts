import { TrainingProgram, DayPlan } from '../types/planner';

const STORAGE_KEY = 'training_planner_program_v1';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(baseDateStr: string, daysToAdd: number): string {
  const d = new Date(baseDateStr);
  d.setDate(d.getDate() + daysToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyProgram(totalDays = 26, startDate = getTodayDateString()): TrainingProgram {
  const days: DayPlan[] = [];
  for (let i = 0; i < totalDays; i++) {
    days.push({
      id: `day-${i + 1}-${Date.now().toString(36)}-${i}`,
      dayNumber: i + 1,
      date: addDaysToDate(startDate, i),
      isRestDay: false,
      priorities: [],
      exercises: []
    });
  }
  return {
    id: `prog-${Date.now().toString(36)}`,
    title: 'Nowy Plan Treningowy',
    startDate,
    totalDays,
    days,
    updatedAt: new Date().toISOString()
  };
}

export function createInitialProgram(totalDays = 26, startDate = getTodayDateString()): TrainingProgram {
  const days: DayPlan[] = [];

  const defaultTemplates: { priorities: string[]; isRestDay: boolean }[] = [
    { priorities: ['Klatka', 'Barki', 'Triceps'], isRestDay: false },
    { priorities: ['Martwy ciąg', 'Plecy', 'Brzuch'], isRestDay: false },
    { priorities: ['Regeneracja'], isRestDay: true },
    { priorities: ['Przysiad', 'Czworogłowe', 'Łydki'], isRestDay: false },
    { priorities: ['Klatka (lekko/technika)', 'Barki', 'Triceps'], isRestDay: false },
    { priorities: ['Regeneracja'], isRestDay: true },
    { priorities: ['Regeneracja'], isRestDay: true }
  ];

  for (let i = 0; i < totalDays; i++) {
    const template = defaultTemplates[i % defaultTemplates.length];
    days.push({
      id: `day-${i + 1}-${Date.now().toString(36)}-${i}`,
      dayNumber: i + 1,
      date: addDaysToDate(startDate, i),
      isRestDay: template.isRestDay,
      priorities: [...template.priorities],
      exercises: []
    });
  }

  return {
    id: 'prog-current',
    title: 'Cykl Trójbojowy',
    startDate,
    totalDays,
    days,
    updatedAt: new Date().toISOString()
  };
}

export function loadProgram(): TrainingProgram {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const initial = createInitialProgram(26);
      saveProgram(initial);
      return initial;
    }
    return JSON.parse(data);
  } catch {
    const initial = createInitialProgram(26);
    saveProgram(initial);
    return initial;
  }
}

export function saveProgram(program: TrainingProgram): void {
  program.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
}
