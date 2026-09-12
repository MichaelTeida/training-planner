import React, { useState, useEffect, useRef } from 'react';
import { TrainingProgram, ExportFormat } from '../types/planner';
import {
  generatePhoneNotes,
  generateMarkdown,
  generateCompactText,
  generateJSON
} from '../utils/exportFormats';
import { X, Copy, Check, Download, Upload, FileUp, AlertCircle } from 'lucide-react';

type ModalTab = ExportFormat | 'import';

interface ExportModalProps {
  program: TrainingProgram;
  isOpen: boolean;
  onClose: () => void;
  onImportProgram: (imported: TrainingProgram) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  program,
  isOpen,
  onClose,
  onImportProgram
}) => {
  const [tab, setTab] = useState<ModalTab>('phone');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importErr, setImportErr] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setImportErr('');
      setImportSuccess('');
      setImportText('');
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: { id: ModalTab; label: string; ext?: string; mime?: string }[] = [
    { id: 'phone', label: 'Notatka na telefon', ext: 'txt', mime: 'text/plain' },
    { id: 'markdown', label: 'Markdown', ext: 'md', mime: 'text/markdown' },
    { id: 'compact', label: 'Kompakt 1-linia', ext: 'txt', mime: 'text/plain' },
    { id: 'json', label: 'Kopia JSON', ext: 'json', mime: 'application/json' },
    { id: 'import', label: 'Importuj plan' },
  ];

  const activeTabConfig = tabs.find((t) => t.id === tab)!;

  const generators: Record<ExportFormat, () => string> = {
    phone: () => generatePhoneNotes(program),
    markdown: () => generateMarkdown(program),
    compact: () => generateCompactText(program),
    json: () => generateJSON(program),
  };

  const exportContent = tab !== 'import' ? generators[tab as ExportFormat]() : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* noop */ }
  };

  const handleDownload = () => {
    if (!activeTabConfig.ext) return;
    const blob = new Blob([exportContent], { type: `${activeTabConfig.mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = program.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'plan_treningowy';
    a.download = `${cleanTitle}.${activeTabConfig.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseAndApply = (rawJson: string) => {
    setImportErr('');
    setImportSuccess('');
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Plik nie zawiera poprawnego obiektu JSON');
      }
      if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
        throw new Error('Brak harmonogramu dni (tablica "days" jest pusta lub nie istnieje)');
      }

      onImportProgram(parsed);
      setImportSuccess(`Zaimportowano pomyślnie plan "${parsed.title || 'Plan'}" (${parsed.days.length} dni)`);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setImportErr(err?.message || 'Nieprawidłowy format pliku JSON');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      parseAndApply(text);
    };
    reader.onerror = () => {
      setImportErr('Nie udało się odczytać pliku z dysku');
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleManualImport = () => {
    if (!importText.trim()) {
      setImportErr('Wklej najpierw zawartość pliku JSON');
      return;
    }
    parseAndApply(importText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-start justify-center p-2.5 sm:px-4 sm:pt-[6vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col min-h-[460px] max-h-[92vh] sm:max-h-[82vh]" onClick={(e) => e.stopPropagation()}>

        {/* Nagłówek */}
        <div className="flex items-center justify-between h-12 px-4 sm:px-5 border-b border-[var(--border-subtle)] shrink-0">
          <span className="text-[12.5px] sm:text-[13px] font-semibold text-[var(--text-primary)]">Eksport i Kopia Zapasowa</span>
          <button type="button" onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Zakładki */}
        <div className="flex gap-1 px-3 sm:px-5 pt-2 pb-0 border-b border-[var(--border-subtle)] shrink-0 bg-white/[0.01] overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setImportErr('');
                setImportSuccess('');
              }}
              className={`px-2.5 sm:px-3 py-1.5 text-[10.5px] sm:text-[11px] font-medium border-b-2 transition-colors -mb-px shrink-0 whitespace-nowrap ${
                tab === t.id
                  ? 'border-[var(--accent)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Zawartość */}
        <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {tab !== 'import' ? (
            <>
              <textarea
                readOnly
                value={exportContent}
                rows={11}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 font-mono text-[11px] text-[var(--text-secondary)] leading-relaxed resize-none outline-none focus:border-[var(--border-default)]"
              />

              {tab === 'json' && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-muted)]">
                  <span>Chcesz wczytać plan z pliku?</span>
                  <button
                    type="button"
                    onClick={() => setTab('import')}
                    className="text-[var(--accent)] hover:underline font-medium"
                  >
                    Przejdź do importu →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 py-1">
              {/* Ukryty input pliku */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Sekcja 1: Wybór pliku z dysku */}
              <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-elevated)] transition flex flex-col items-center justify-center gap-2.5 text-center">
                <FileUp className="w-6 h-6 text-[var(--text-muted)]" />
                <div>
                  <div className="text-[12px] font-medium text-[var(--text-primary)]">
                    Wgraj plik kopii zapasowej (.json)
                  </div>
                  <div className="text-[10.5px] text-[var(--text-faint)]">
                    Automatycznie załaduje plan, dni i rozpisane ćwiczenia
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 h-8 px-4 text-[11px] font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg flex items-center gap-1.5 transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Wybierz plik z dysku</span>
                </button>
              </div>

              {/* Sekcja 2: Wklejanie tekstu JSON */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[var(--text-muted)] font-medium">
                  Lub wklej kod JSON bezpośrednio:
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportErr('');
                  }}
                  placeholder='{"title": "Plan", "days": [...]}'
                  rows={5}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 font-mono text-[11px] text-[var(--text-primary)] placeholder-[var(--text-faint)] resize-none outline-none focus:border-[var(--border-default)]"
                />
              </div>

              {/* Komunikaty */}
              {importErr && (
                <div className="flex items-center gap-2 text-[11px] text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importErr}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stopka */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-5 py-3 border-t border-[var(--border-subtle)] shrink-0 gap-2">
          <div className="text-[11px] text-center sm:text-left">
            {copied && (
              <span className="text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5" /> Skopiowano do schowka
              </span>
            )}
          </div>

          {tab !== 'import' ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 sm:flex-initial justify-center h-8 px-3 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pobierz .{activeTabConfig.ext}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial justify-center min-w-[95px] h-8 px-4 text-[11px] font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg flex items-center gap-1.5 transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Skopiowano' : 'Kopiuj'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleManualImport}
              className="h-8 px-4 text-[11px] font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm sm:ml-auto"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Zastosuj import</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
