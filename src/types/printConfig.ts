export type PrintStyle = 'cards' | 'table' | 'minimal';
export type PrintColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PrintConfig {
  style: PrintStyle;
  columns: PrintColumns;
  showNotes: boolean;
  showWeightRpe: boolean;
  showRestDays: boolean;
  compactSpacing: boolean;
}

export const DEFAULT_PRINT_CONFIG: PrintConfig = {
  style: 'cards',
  columns: 2,
  showNotes: true,
  showWeightRpe: true,
  showRestDays: true,
  compactSpacing: false,
};
