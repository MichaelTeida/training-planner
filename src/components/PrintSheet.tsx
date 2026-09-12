import React from 'react';
import { TrainingProgram } from '../types/planner';
import { PrintConfig } from '../types/printConfig';
import { getDayOfWeekName, formatDateCompact } from '../utils/exportFormats';

interface PrintSheetProps {
  program: TrainingProgram;
  config: PrintConfig;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ program, config }) => {
  const daysToDisplay = config.showRestDays
    ? program.days
    : program.days.filter((d) => !d.isRestDay);

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
    gap: config.compactSpacing ? '4px' : '6px',
  };

  return (
    <div
      className={`print-only p-4 bg-white text-black max-w-[210mm] mx-auto print-style-${config.style} ${
        config.compactSpacing ? 'print-compact' : ''
      }`}
      style={{ '--print-cols': config.columns } as React.CSSProperties}
    >
      {/* Nagłówek wydruku */}
      <div className="border-b-2 border-black pb-2 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight leading-none">
            {program.title}
          </h1>
          <p className="text-[10px] text-gray-700 mt-1">
            Start: <strong>{program.startDate}</strong> | Dni łącznie: <strong>{program.totalDays}</strong> (Treningowe: <strong>{program.days.filter(d => !d.isRestDay).length}</strong>, Odpoczynek: <strong>{program.days.filter(d => d.isRestDay).length}</strong>)
          </p>
        </div>
        <div className="text-right text-[9px] text-gray-500 font-mono">
          Wygenerowano: {new Date().toLocaleDateString('pl-PL')} · Kolumny: {config.columns}
        </div>
      </div>

      {/* 1. STYL KART (cards) */}
      {config.style === 'cards' && (
        <div className="print-grid" style={gridStyle}>
          {daysToDisplay.map((day) => {
            const dayOfWeek = getDayOfWeekName(day.date, true);
            const dateFormatted = formatDateCompact(day.date);
            const p1 = day.priorities[0];
            const secondary = day.priorities.slice(1);

            return (
              <div
                key={day.id}
                className={`print-card ${day.isRestDay ? 'print-rest' : ''}`}
                style={{ padding: config.compactSpacing ? '4px 6px' : '6px 8px' }}
              >
                <div className="flex items-center justify-between border-b border-gray-300 pb-1 mb-1">
                  <span className="font-bold text-[11px]">
                    D{String(day.dayNumber).padStart(2, '0')} ({dayOfWeek.slice(0, 2)}, {dateFormatted})
                  </span>
                  {day.isRestDay && (
                    <span className="text-[9px] uppercase font-bold text-gray-500">
                      Odpoczynek
                    </span>
                  )}
                </div>

                {day.isRestDay ? (
                  <div className="text-center py-1.5 text-[10px] italic text-gray-500">
                    Regeneracja / Przerwa
                  </div>
                ) : (
                  <div className="space-y-1">
                    {p1 && (
                      <div className="print-badge-primary px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                        <span className="text-[8px] uppercase font-mono font-black">#1</span>
                        <span className="font-bold uppercase truncate">{p1}</span>
                      </div>
                    )}

                    {secondary.length > 0 && (
                      <div className="text-[9px] text-gray-700 leading-tight">
                        <strong>Dodatki:</strong> {secondary.join(', ')}
                      </div>
                    )}

                    {day.exercises.length > 0 && (
                      <div className="pt-1 border-t border-gray-200 mt-1 space-y-0.5">
                        {day.exercises.map((ex) => (
                          <div key={ex.id} className="text-[9.5px] flex justify-between gap-1 leading-tight">
                            <span className="truncate">• {ex.name}</span>
                            <span className="font-mono font-medium shrink-0 text-right">
                              {ex.sets}
                              {config.showWeightRpe && ex.weightOrRpe ? ` (${ex.weightOrRpe})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {config.showNotes && day.notes && (
                      <div className="text-[8.5px] text-gray-500 italic mt-0.5 border-t border-dotted border-gray-200 pt-0.5">
                        {day.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. STYL TABELI (table) */}
      {config.style === 'table' && (
        <div className="print-table-container">
          <table className="w-full text-left border-collapse border border-gray-400 text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="p-1 border-r border-gray-400 w-12 font-bold text-center">Dzień</th>
                <th className="p-1 border-r border-gray-400 w-14 font-bold text-center">Data</th>
                <th className="p-1 border-r border-gray-400 w-32 font-bold">Priorytet / Cel</th>
                <th className="p-1 border-r border-gray-400 font-bold">Ćwiczenia i obciążenie</th>
                {config.showNotes && (
                  <th className="p-1 border-gray-400 w-28 font-bold">Notatki</th>
                )}
              </tr>
            </thead>
            <tbody>
              {daysToDisplay.map((day) => {
                const dayOfWeek = getDayOfWeekName(day.date, true);
                const dateFormatted = formatDateCompact(day.date);
                const p1 = day.priorities[0];
                const secondary = day.priorities.slice(1);

                return (
                  <tr
                    key={day.id}
                    className={`border-b border-gray-300 ${
                      day.isRestDay ? 'bg-gray-50 italic text-gray-500' : ''
                    }`}
                  >
                    <td className="p-1 border-r border-gray-300 font-mono font-bold text-center">
                      D{String(day.dayNumber).padStart(2, '0')}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-center font-mono text-[9px]">
                      {dayOfWeek.slice(0, 2)} {dateFormatted}
                    </td>
                    <td className="p-1 border-r border-gray-300">
                      {day.isRestDay ? (
                        <span className="font-semibold text-gray-500">REGENERACJA</span>
                      ) : (
                        <div>
                          {p1 && <div className="font-bold text-red-700 uppercase">{p1}</div>}
                          {secondary.length > 0 && (
                            <div className="text-[9px] text-gray-600">{secondary.join(', ')}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-1 border-r border-gray-300">
                      {day.exercises.length > 0 ? (
                        <div className="space-y-0.5">
                          {day.exercises.map((ex) => (
                            <div key={ex.id} className="flex justify-between gap-2 text-[9px]">
                              <span>• {ex.name}</span>
                              <span className="font-mono shrink-0 font-medium">
                                {ex.sets}
                                {config.showWeightRpe && ex.weightOrRpe ? ` [${ex.weightOrRpe}]` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : day.isRestDay ? (
                        <span className="text-[9px] text-gray-400">Dzień odpoczynku</span>
                      ) : (
                        <span className="text-[9px] text-gray-400">—</span>
                      )}
                    </td>
                    {config.showNotes && (
                      <td className="p-1 text-[9px] italic text-gray-600">
                        {day.notes || '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. STYL MINIMALISTYCZNY (minimal) */}
      {config.style === 'minimal' && (
        <div className="print-grid" style={gridStyle}>
          {daysToDisplay.map((day) => {
            const dayOfWeek = getDayOfWeekName(day.date, true);
            const dateFormatted = formatDateCompact(day.date);
            const p1 = day.priorities[0];

            return (
              <div
                key={day.id}
                className="p-1 border-b border-gray-300 break-inside-avoid text-[9.5px]"
              >
                <div className="flex items-center justify-between font-bold text-[10px] mb-0.5">
                  <span>D{day.dayNumber} ({dayOfWeek.slice(0, 2)} {dateFormatted})</span>
                  {day.isRestDay ? (
                    <span className="text-gray-400 uppercase text-[8.5px]">Rest</span>
                  ) : p1 ? (
                    <span className="text-red-700 uppercase text-[9px] font-bold truncate max-w-[50%] text-right">{p1}</span>
                  ) : null}
                </div>

                {!day.isRestDay && day.exercises.length > 0 && (
                  <div className="space-y-0.5 text-[9px] text-gray-800">
                    {day.exercises.map((ex) => (
                      <div key={ex.id} className="flex justify-between gap-1 leading-tight">
                        <span className="truncate">{ex.name}</span>
                        <span className="font-mono shrink-0 font-medium">
                          {ex.sets}
                          {config.showWeightRpe && ex.weightOrRpe ? ` (${ex.weightOrRpe})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {config.showNotes && day.notes && (
                  <div className="text-[8px] text-gray-500 italic mt-0.5">
                    {day.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
