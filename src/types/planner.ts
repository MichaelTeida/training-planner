export interface ExerciseItem {
  id: string;
  name: string;
  sets: string;
  weightOrRpe?: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string;
  isRestDay: boolean;
  priorities: string[];
  exercises: ExerciseItem[];
  notes?: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  startDate: string;
  totalDays: number;
  days: DayPlan[];
  updatedAt: string;
}

export type ViewMode = 'list' | 'cards' | 'calendar';

export type ExportFormat = 'phone' | 'markdown' | 'compact' | 'json';
