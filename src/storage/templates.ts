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

export function createBenchFocusTemplate(): TrainingProgram {
  const startDate = getTodayDateString();
  const rawDays = [
    {
      id: "day-1-bf-0",
      dayNumber: 1,
      isRestDay: false,
      priorities: ["Klatka", "Barki", "Triceps", "Rotatory"],
      exercises: [
        { id: "e-1-1", name: "Ławka płaska z pauzą 2s", sets: "6x3", weightOrRpe: "" },
        { id: "e-1-2", name: "Wyciskanie hantli ławka płaska", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-1-3", name: "OHP", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-1-4", name: "Wyciskanie francuskie sztangą leżąc", sets: "4x8", weightOrRpe: "" },
        { id: "e-1-5", name: "Face Pulls", sets: "4x15", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-2-bf-1",
      dayNumber: 2,
      isRestDay: false,
      priorities: ["Plecy dół", "Plecy góra", "Triceps", "Brzuch"],
      exercises: [
        { id: "e-2-1", name: "Martwy klasyczny", sets: "6x3-5", weightOrRpe: "" },
        { id: "e-2-2", name: "Wiosłowanie sztangą w opadzie", sets: "6x6-8", weightOrRpe: "" },
        { id: "e-2-3", name: "Ściąganie drążka wyciągu górnego", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-2-4", name: "JM Press", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-2-5", name: "Abdominal crunch", sets: "4x12", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-3-bf-2",
      dayNumber: 3,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-4-bf-3",
      dayNumber: 4,
      isRestDay: false,
      priorities: ["Klatka", "Triceps", "Barki"],
      exercises: [
        { id: "e-4-1", name: "Ławka płaska", sets: "6x3-6", weightOrRpe: "" },
        { id: "e-4-2", name: "Wąskie wyciskanie", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-4-3", name: "OHP", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-4-4", name: "Dipy", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-4-5", name: "Wyciskanie francuskie sztangą leżąc", sets: "4x8", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-5-bf-4",
      dayNumber: 5,
      isRestDay: false,
      priorities: ["Nogi", "Barki", "Łydki", "Brzuch"],
      exercises: [
        { id: "e-5-1", name: "Przysiady sztanga na plecach", sets: "6x4-8", weightOrRpe: "" },
        { id: "e-5-2", name: "Leg Curls", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-5-3", name: "Łydki", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-5-4", name: "Wznosy", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-5-5", name: "Cross body cable y raise", sets: "2x10", weightOrRpe: "" },
        { id: "e-5-6", name: "Allahy", sets: "4x8-14", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-6-bf-5",
      dayNumber: 6,
      isRestDay: false,
      priorities: ["Klatka", "Triceps", "Plecy góra", "Rotatory"],
      exercises: [
        { id: "e-6-1", name: "Spoto Press", sets: "4x4-6", weightOrRpe: "75% RM" },
        { id: "e-6-2", name: "Wyciskanie hantli ławka dodatnia", sets: "4x8-10", weightOrRpe: "" },
        { id: "e-6-3", name: "Ściąganie drążka wyciągu górnego", sets: "6x10-12", weightOrRpe: "" },
        { id: "e-6-4", name: "JM Press", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-6-5", name: "Prostowanie przedramion z liną górnego wyciągu", sets: "2x10", weightOrRpe: "" },
        { id: "e-6-6", name: "Rotacje zewnętrzne ramienia na wyciągu", sets: "3x15", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-7-bf-6",
      dayNumber: 7,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-8-bf-7",
      dayNumber: 8,
      isRestDay: false,
      priorities: ["Klatka", "Barki", "Triceps", "Rotatory"],
      exercises: [
        { id: "e-8-1", name: "Ławka płaska z pauzą 2s", sets: "6x3", weightOrRpe: "" },
        { id: "e-8-2", name: "Wyciskanie hantli ławka płaska", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-8-3", name: "OHP", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-8-4", name: "Wyciskanie francuskie sztangą leżąc", sets: "4x8", weightOrRpe: "" },
        { id: "e-8-5", name: "Face Pulls", sets: "4x15", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-9-bf-8",
      dayNumber: 9,
      isRestDay: false,
      priorities: ["Plecy dół", "Plecy góra", "Triceps", "Brzuch"],
      exercises: [
        { id: "e-9-1", name: "Martwy klasyczny", sets: "6x3-5", weightOrRpe: "" },
        { id: "e-9-2", name: "Wiosłowanie sztangą w opadzie", sets: "6x6-8", weightOrRpe: "" },
        { id: "e-9-3", name: "Ściąganie drążka wyciągu górnego", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-9-4", name: "JM Press", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-9-5", name: "Abdominal crunch", sets: "4x12", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-10-bf-9",
      dayNumber: 10,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-11-bf-10",
      dayNumber: 11,
      isRestDay: false,
      priorities: ["Klatka", "Triceps", "Barki"],
      exercises: [
        { id: "e-11-1", name: "Ławka płaska", sets: "6x3-6", weightOrRpe: "" },
        { id: "e-11-2", name: "Wąskie wyciskanie", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-11-3", name: "OHP", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-11-4", name: "Dipy", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-11-5", name: "Wyciskanie francuskie sztangą leżąc", sets: "4x8", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-12-bf-11",
      dayNumber: 12,
      isRestDay: false,
      priorities: ["Nogi", "Barki", "Łydki", "Brzuch"],
      exercises: [
        { id: "e-12-1", name: "Przysiady sztanga na plecach", sets: "6x4-8", weightOrRpe: "" },
        { id: "e-12-2", name: "Leg Curls", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-12-3", name: "Łydki", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-12-4", name: "Wznosy", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-12-5", name: "Cross body cable y raise", sets: "2x10", weightOrRpe: "" },
        { id: "e-12-6", name: "Allahy", sets: "4x8-14", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-13-bf-12",
      dayNumber: 13,
      isRestDay: false,
      priorities: ["Klatka", "Triceps", "Plecy góra", "Rotatory"],
      exercises: [
        { id: "e-13-1", name: "Spoto Press", sets: "4x4-6", weightOrRpe: "75% RM" },
        { id: "e-13-2", name: "Wyciskanie hantli ławka dodatnia", sets: "4x8-10", weightOrRpe: "" },
        { id: "e-13-3", name: "Ściąganie drążka wyciągu górnego", sets: "6x10-12", weightOrRpe: "" },
        { id: "e-13-4", name: "JM Press", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-13-5", name: "Prostowanie przedramion z liną górnego wyciągu", sets: "2x10", weightOrRpe: "" },
        { id: "e-13-6", name: "Rotacje zewnętrzne ramienia na wyciągu", sets: "3x15", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-14-bf-13",
      dayNumber: 14,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-15-bf-14",
      dayNumber: 15,
      isRestDay: false,
      priorities: ["Nogi", "Klatka", "Plecy góra", "Brzuch"],
      exercises: [
        { id: "e-15-1", name: "Przysiady sztanga na plecach (rozgrzewka)", sets: "3x5-2", weightOrRpe: "" },
        { id: "e-15-2", name: "Przysiady sztanga na plecach (Top Single)", sets: "1x1", weightOrRpe: "RPE 8" },
        { id: "e-15-3", name: "Przysiady sztanga na plecach (serie robocze)", sets: "3x3", weightOrRpe: "RPE 7.5" },
        { id: "e-15-4", name: "Ławka płaska (rozgrzewka)", sets: "3x5-2", weightOrRpe: "" },
        { id: "e-15-5", name: "Ławka płaska (Top Single)", sets: "1x1", weightOrRpe: "RPE 8" },
        { id: "e-15-6", name: "Ławka płaska (serie robocze)", sets: "3x3", weightOrRpe: "RPE 7.5" },
        { id: "e-15-8", name: "Wiosłowanie hantlami w oparciu o ławkę (Seal Row)", sets: "3x8", weightOrRpe: "RPE 7" },
        { id: "e-15-10", name: "Allahy z pauzą 2s", sets: "3x10-12", weightOrRpe: "RPE 8" }
      ],
      notes: ""
    },
    {
      id: "day-16-bf-15",
      dayNumber: 16,
      isRestDay: false,
      priorities: ["Plecy dół", "Klatka", "Nogi", "Rotatory"],
      exercises: [
        { id: "e-16-1", name: "Martwy klasyczny (rozgrzewka)", sets: "3x5-2", weightOrRpe: "" },
        { id: "e-16-2", name: "Martwy klasyczny (Top Single)", sets: "1x1", weightOrRpe: "RPE 8" },
        { id: "e-16-3", name: "Martwy klasyczny (serie robocze)", sets: "2x3", weightOrRpe: "RPE 7.5" },
        { id: "e-16-4", name: "Ławka płaska z pauzą 2s (rozgrzewka)", sets: "2x5-3", weightOrRpe: "" },
        { id: "e-16-5", name: "Ławka płaska z pauzą 2s", sets: "3x3", weightOrRpe: "RPE 7.5" },
        { id: "e-16-7", name: "Leg Curls", sets: "3x10", weightOrRpe: "RPE 7.5" },
        { id: "e-16-8", name: "Face Pulls", sets: "3x15", weightOrRpe: "RPE 7" }
      ],
      notes: ""
    },
    {
      id: "day-17-bf-16",
      dayNumber: 17,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-18-bf-17",
      dayNumber: 18,
      isRestDay: false,
      priorities: ["Nogi", "Klatka", "Plecy góra", "Biceps"],
      exercises: [
        { id: "e-18-1", name: "Przysiady sztanga na plecach z pauzą 2s (rozgrzewka)", sets: "3x5-2", weightOrRpe: "" },
        { id: "e-18-2", name: "Przysiady sztanga na plecach z pauzą 2s", sets: "3x3", weightOrRpe: "RPE 7" },
        { id: "e-18-3", name: "Ławka płaska (rozgrzewka)", sets: "3x10-3", weightOrRpe: "" },
        { id: "e-18-4", name: "Ławka płaska", sets: "4x4", weightOrRpe: "RPE 7.5" },
        { id: "e-18-6", name: "Ściąganie drążka wyciągu górnego", sets: "3x10", weightOrRpe: "RPE 7" },
        { id: "e-18-8", name: "Uginanie ramion ze sztangielkami", sets: "3x10-12", weightOrRpe: "RPE 7.5" }
      ],
      notes: ""
    },
    {
      id: "day-mtyhcg29",
      dayNumber: 19,
      isRestDay: false,
      priorities: ["Plecy dół", "Klatka", "Barki", "Brzuch"],
      exercises: [
        { id: "e-19-1", name: "Martwy ciąg z pauzą pod kolanem (rozgrzewka)", sets: "3x5-2", weightOrRpe: "" },
        { id: "e-19-2", name: "Martwy ciąg z pauzą pod kolanem", sets: "3x3", weightOrRpe: "RPE 7" },
        { id: "e-19-4", name: "Wyciskanie hantli ławka płaska", sets: "3x10-8", weightOrRpe: "RPE 7.5" },
        { id: "e-19-5", name: "Wznosy", sets: "3x15-12", weightOrRpe: "RPE 8" },
        { id: "e-19-6", name: "Unoszenie nóg w zwisie", sets: "3x12-10", weightOrRpe: "RPE 7.5" }
      ],
      notes: ""
    },
    {
      id: "day-20-bf-19",
      dayNumber: 20,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-21-bf-20",
      dayNumber: 21,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-22-bf-21",
      dayNumber: 22,
      isRestDay: false,
      priorities: ["Klatka", "Barki", "Triceps", "Rotatory"],
      exercises: [
        { id: "e-22-1", name: "Ławka płaska z pauzą 2s", sets: "6x3", weightOrRpe: "" },
        { id: "e-22-2", name: "Wyciskanie hantli ławka płaska", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-22-3", name: "OHP", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-22-4", name: "Wyciskanie francuskie sztangą leżąc", sets: "4x8", weightOrRpe: "" },
        { id: "e-22-5", name: "Face Pulls", sets: "4x15", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-23-bf-22",
      dayNumber: 23,
      isRestDay: false,
      priorities: ["Plecy dół", "Plecy góra", "Triceps", "Brzuch"],
      exercises: [
        { id: "e-23-1", name: "Martwy klasyczny", sets: "6x3-5", weightOrRpe: "" },
        { id: "e-23-2", name: "Wiosłowanie sztangą w opadzie", sets: "6x6-8", weightOrRpe: "" },
        { id: "e-23-3", name: "Ściąganie drążka wyciągu górnego", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-23-4", name: "JM Press", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-23-5", name: "Abdominal crunch", sets: "4x12", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-24-bf-23",
      dayNumber: 24,
      isRestDay: true,
      priorities: [],
      exercises: [],
      notes: ""
    },
    {
      id: "day-25-bf-24",
      dayNumber: 25,
      isRestDay: false,
      priorities: ["Klatka", "Triceps", "Barki"],
      exercises: [
        { id: "e-25-1", name: "Ławka płaska", sets: "6x3-6", weightOrRpe: "" },
        { id: "e-25-2", name: "Wąskie wyciskanie", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-25-3", name: "OHP", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-25-4", name: "Dipy", sets: "4x6-8", weightOrRpe: "" },
        { id: "e-25-5", name: "Wyciskanie francuskie sztangą leżąc", sets: "4x8", weightOrRpe: "" }
      ],
      notes: ""
    },
    {
      id: "day-26-bf-25",
      dayNumber: 26,
      isRestDay: false,
      priorities: ["Nogi", "Barki", "Łydki", "Brzuch"],
      exercises: [
        { id: "e-26-1", name: "Przysiady sztanga na plecach", sets: "6x4-8", weightOrRpe: "" },
        { id: "e-26-2", name: "Leg Curls", sets: "4x8-12", weightOrRpe: "" },
        { id: "e-26-3", name: "Łydki", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-26-4", name: "Wznosy", sets: "4x10-12", weightOrRpe: "" },
        { id: "e-26-5", name: "Cross body cable y raise", sets: "2x10", weightOrRpe: "" },
        { id: "e-26-6", name: "Allahy", sets: "4x8-14", weightOrRpe: "" }
      ],
      notes: ""
    }
  ];

  const days: DayPlan[] = rawDays.map((d, i) => ({
    ...d,
    date: addDaysToDate(startDate, i)
  }));

  return {
    id: "prog-bench-focus-pl",
    title: "Trening Bench Focus + Powerlifting",
    startDate,
    totalDays: days.length,
    days,
    updatedAt: new Date().toISOString()
  };
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
  { id: 'bench-focus', name: 'Bench Focus + Powerlifting (26 dni)', create: createBenchFocusTemplate },
  { id: 'powerlifting', name: 'Cykl Trójbojowy (26 dni)', create: createPowerliftingTemplate },
  { id: 'ppl', name: 'Push / Pull / Legs (28 dni)', create: createPPLTemplate },
] as const;
