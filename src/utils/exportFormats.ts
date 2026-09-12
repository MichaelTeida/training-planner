import { TrainingProgram } from '../types/planner';

const POLISH_DAYS_SHORT = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
const POLISH_DAYS_FULL = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

export function getDayOfWeekName(dateStr: string, full = false): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay();
  return full ? POLISH_DAYS_FULL[dayIndex] : POLISH_DAYS_SHORT[dayIndex];
}

export function formatDateCompact(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}`;
  }
  return dateStr;
}

export function generatePhoneNotes(program: TrainingProgram): string {
  const lines: string[] = [];
  lines.push(`🏋️ ${program.title.toUpperCase()} (${program.totalDays} DNI)`);
  lines.push(`Start: ${program.startDate}`);
  lines.push('═'.repeat(30));
  lines.push('');

  program.days.forEach((day) => {
    const dayOfWeek = getDayOfWeekName(day.date, true);
    const dateFormatted = formatDateCompact(day.date);

    if (day.isRestDay) {
      lines.push(`⚪ Dzień ${day.dayNumber} (${dayOfWeek}, ${dateFormatted})`);
      lines.push(`   🛌 REGENERACJA / PRZERWA`);
    } else {
      const p1 = day.priorities[0] || 'Trening';
      const secondary = day.priorities.slice(1);

      lines.push(`🔴 Dzień ${day.dayNumber} (${dayOfWeek}, ${dateFormatted})`);
      lines.push(`   PRIORYTET #1: ${p1.toUpperCase()}`);
      if (secondary.length > 0) {
        lines.push(`   Dodatki: ${secondary.join(', ')}`);
      }
      if (day.exercises.length > 0) {
        day.exercises.forEach((ex) => {
          const detail = ex.weightOrRpe ? ` (${ex.weightOrRpe})` : '';
          lines.push(`   • ${ex.name}: ${ex.sets}${detail}`);
        });
      }
    }
    if (day.notes) {
      lines.push(`   Notatka: ${day.notes}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

export function generateMarkdown(program: TrainingProgram): string {
  const lines: string[] = [];
  lines.push(`# ${program.title}`);
  lines.push(`*Rozpoczęcie: ${program.startDate} | Liczba dni: ${program.totalDays}*`);
  lines.push('');

  program.days.forEach((day) => {
    const dayOfWeek = getDayOfWeekName(day.date, true);
    const dateFormatted = formatDateCompact(day.date);

    if (day.isRestDay) {
      lines.push(`### - [ ] Dzień ${day.dayNumber}: ${dayOfWeek} (${dateFormatted}) - 💤 Regeneracja`);
    } else {
      const p1 = day.priorities[0] ? `**${day.priorities[0]}**` : 'Trening';
      const secondary = day.priorities.slice(1).join(', ');
      const title = secondary ? `${p1}, ${secondary}` : p1;

      lines.push(`### - [ ] Dzień ${day.dayNumber}: ${dayOfWeek} (${dateFormatted}) - ${title}`);
      if (day.exercises.length > 0) {
        day.exercises.forEach((ex) => {
          const weight = ex.weightOrRpe ? ` | ${ex.weightOrRpe}` : '';
          lines.push(`  - [ ] ${ex.name} — ${ex.sets}${weight}`);
        });
      }
    }
    if (day.notes) {
      lines.push(`  > ${day.notes}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

export function generateCompactText(program: TrainingProgram): string {
  const lines: string[] = [];
  lines.push(`=== ${program.title.toUpperCase()} (${program.totalDays} DNI) ===`);

  program.days.forEach((day) => {
    const dNum = String(day.dayNumber).padStart(2, '0');
    const dayOfWeek = getDayOfWeekName(day.date, false);
    const dateFormatted = formatDateCompact(day.date);

    if (day.isRestDay) {
      lines.push(`D${dNum} [${dayOfWeek} ${dateFormatted}] -- REGENERACJA --`);
    } else {
      const p1 = day.priorities[0] || 'Trening';
      const secondary = day.priorities.slice(1).join(', ');
      const rest = secondary ? ` + ${secondary}` : '';
      lines.push(`D${dNum} [${dayOfWeek} ${dateFormatted}] [${p1.toUpperCase()}]${rest}`);
    }
  });

  return lines.join('\n');
}

export function generateJSON(program: TrainingProgram): string {
  return JSON.stringify(program, null, 2);
}
