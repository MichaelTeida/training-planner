import { TrainingProgram, DayPlan } from '../types/planner';
import { addDaysToDate, getTodayDateString } from './localStore';

function makeDays(configs: { priorities: string[]; rest: boolean }[], startDate: string): DayPlan[] {
  return configs.map((c, i) => ({
    id: `day-${i + 1}-${Date.now().toString(36)}-${i}`,
    dayNumber: i + 1,
    date: addDaysToDate(startDate, i),
    isRestDay: c.rest,
    priorities: c.priorities,
    exercises: []
  }));
}

function repeat<T>(arr: T[], times: number): T[] {
  const out: T[] = [];
  for (let t = 0; t < times; t++) out.push(...arr);
  return out;
}

export function createPowerliftingTemplate(): TrainingProgram {
  const startDate = getTodayDateString();
  const week: { priorities: string[]; rest: boolean }[] = [
    { priorities: ['Przysiad', 'Czworogłowe', 'Łydki'], rest: false },
    { priorities: ['Klatka', 'Barki', 'Triceps'], rest: false },
    { priorities: [], rest: true },
    { priorities: ['Martwy ciąg', 'Plecy', 'Brzuch'], rest: false },
    { priorities: ['Klatka (lekko)', 'Barki', 'Triceps'], rest: false },
    { priorities: [], rest: true },
    { priorities: [], rest: true },
  ];
  const configs = repeat(week, 4).slice(0, 26);
  const days = makeDays(configs, startDate);

  return {
    id: 'prog-pl',
    title: 'Cykl Trójbojowy',
    startDate,
    totalDays: days.length,
    days,
    updatedAt: new Date().toISOString()
  };
}

export function createPPLTemplate(): TrainingProgram {
  const startDate = getTodayDateString();
  const week: { priorities: string[]; rest: boolean }[] = [
    { priorities: ['Klatka', 'Barki', 'Triceps'], rest: false },
    { priorities: ['Plecy', 'Biceps', 'Brzuch'], rest: false },
    { priorities: ['Przysiad', 'Czworogłowe', 'Dwugłowe', 'Łydki'], rest: false },
    { priorities: [], rest: true },
    { priorities: ['Klatka', 'Barki', 'Triceps'], rest: false },
    { priorities: ['Plecy', 'Biceps', 'Brzuch'], rest: false },
    { priorities: [], rest: true },
  ];
  const configs = repeat(week, 4);
  const days = makeDays(configs, startDate);

  return {
    id: 'prog-ppl',
    title: 'Push / Pull / Legs',
    startDate,
    totalDays: days.length,
    days,
    updatedAt: new Date().toISOString()
  };
}

export const TEMPLATES = [
  { id: 'powerlifting', name: 'Trójbój siłowy (26 dni)', create: createPowerliftingTemplate },
  { id: 'ppl', name: 'Push / Pull / Legs (28 dni)', create: createPPLTemplate },
] as const;
