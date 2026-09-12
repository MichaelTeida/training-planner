import React, { useState, useMemo, useEffect } from 'react';
import { TrainingProgram, DayPlan } from '../types/planner';
import { ChevronDown, ChevronRight, AlertTriangle, X, Info, BookOpen } from 'lucide-react';

type Range = 'all' | 'week1' | 'week2' | 'week3' | 'week4';

interface StatsPanelProps {
  program: TrainingProgram;
  isOpen: boolean;
  onClose: () => void;
}

interface CoachAdvice {
  id: string;
  type: 'caution' | 'warning' | 'info';
  title: string;
  rationale: string;
}

const RANGE_OPTIONS: { id: Range; label: string }[] = [
  { id: 'all', label: 'Cały cykl' },
  { id: 'week1', label: 'Tydzień 1 (D01–D07)' },
  { id: 'week2', label: 'Tydzień 2 (D08–D14)' },
  { id: 'week3', label: 'Tydzień 3 (D15–D21)' },
  { id: 'week4', label: 'Tydzień 4 (D22–D28)' },
];

function parseSetsCount(setsStr: string): number {
  if (!setsStr) return 0;
  const match = setsStr.match(/^(\d+)\s*[xX×]/);
  if (match) {
    const val = parseInt(match[1], 10);
    return isNaN(val) ? 1 : val;
  }
  const directNum = parseInt(setsStr, 10);
  return !isNaN(directNum) && directNum > 0 ? directNum : 1;
}

function hasTerm(day: DayPlan, queries: string[]): boolean {
  return queries.some((q) => {
    const lower = q.toLowerCase();
    const inPriorities = day.priorities.some((p) => p.toLowerCase().includes(lower));
    const inExercises = day.exercises.some((e) => e.name.toLowerCase().includes(lower));
    return inPriorities || inExercises;
  });
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ program, isOpen, onClose }) => {
  const [range, setRange] = useState<Range>('all');
  const [showNotes, setShowNotes] = useState(false);
  const [expandedRationaleId, setExpandedRationaleId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredDays = useMemo(() => {
    switch (range) {
      case 'week1': return program.days.slice(0, 7);
      case 'week2': return program.days.slice(7, 14);
      case 'week3': return program.days.slice(14, 21);
      case 'week4': return program.days.slice(21, 28);
      default: return program.days;
    }
  }, [program.days, range]);

  const stats = useMemo(() => {
    const total = filteredDays.length;
    const training = filteredDays.filter((d) => !d.isRestDay);
    const rest = filteredDays.filter((d) => d.isRestDay);

    const tagCounts = new Map<string, number>();
    training.forEach((d) => {
      d.priorities.forEach((p) => {
        const normalized = p.replace(/\s*\(.*\)/, '').trim();
        tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
      });
    });

    const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
    const totalTags = sorted.reduce((sum, [, c]) => sum + c, 0);
    const exerciseCount = training.reduce((sum, d) => sum + d.exercises.length, 0);

    // Suma i analiza serii roboczych
    const daySetsMap = training.map((d) => ({
      day: d,
      sets: d.exercises.reduce((acc, ex) => acc + parseSetsCount(ex.sets), 0)
    }));
    const totalSets = daySetsMap.reduce((acc, item) => acc + item.sets, 0);
    const maxSetsDay = daySetsMap.reduce((max, cur) => cur.sets > (max?.sets || 0) ? cur : max, daySetsMap[0]);

    const primaryCounts = new Map<string, number>();
    training.forEach((d) => {
      if (d.priorities[0]) {
        const n = d.priorities[0].replace(/\s*\(.*\)/, '').trim();
        primaryCounts.set(n, (primaryCounts.get(n) || 0) + 1);
      }
    });
    const primarySorted = [...primaryCounts.entries()].sort((a, b) => b[1] - a[1]);

    // Inteligentna diagnostyka trenerska i naukowa
    const adviceList: CoachAdvice[] = [];
    const restRatio = total > 0 ? rest.length / total : 0;

    // 1. Zmęczenie OUN i regeneracja
    if (restRatio < 0.2 && total >= 7) {
      adviceList.push({
        id: 'cns-rest-ratio',
        type: 'caution',
        title: `Zbyt niska objętość regeneracji (${rest.length} dni z ${total} = ${Math.round(restRatio * 100)}%)`,
        rationale: 'Zasada kompensacji i neuro-regeneracji (Zatsiorsky, 1995; Helms et al., 2014). Ciężki trening oporowy wywołuje nie tylko mikrourazy miofibrylarne, lecz przede wszystkim zmęczenie ośrodkowe (CNS fatigue). Zbyt mała liczba dni odpoczynku zaburza superkompensację i resyntezę glikogenu, drastycznie podnosząc ryzyko przetrenowania niefunkcjonalnego.'
      });
    } else if (restRatio > 0.55 && total >= 7) {
      adviceList.push({
        id: 'cns-rest-high',
        type: 'info',
        title: 'Większość dni to regeneracja — możliwość zwiększenia częstotliwości',
        rationale: 'Krzywa adaptacji do bodźca (Schoenfeld, 2016). Przy ponad 55% dni odpoczynku w cyklu sygnał anaboliczny (MPS) może wygasać przed kolejną stymulacją, ograniczając tempo adaptacji nerwowo-mięśniowej.'
      });
    }

    // 2. Ciągi treningowe bez przerwy
    const consecutiveTraining = filteredDays.reduce((max, d, i, arr) => {
      if (d.isRestDay) return max;
      let streak = 1;
      let j = i + 1;
      while (j < arr.length && !arr[j].isRestDay) { streak++; j++; }
      return Math.max(max, streak);
    }, 0);

    if (consecutiveTraining >= 4) {
      adviceList.push({
        id: 'streak-fatigue',
        type: 'caution',
        title: `Ciąg ${consecutiveTraining} treningów z rzędu bez dnia odpoczynku`,
        rationale: 'Model Impuls-Odpowiedź Banistera (Fitness-Fatigue Model). Kumulacja zmęczenia powyżej 3 kolejnych dób treningu siłowego obniża zdolność do generowania maksymalnej siły eksplozywnej (RFD) o 15–20% i podnosi poziom kortyzolu. Optymalny model zakłada dzień restu co 2–3 sesje.'
      });
    }

    // 3. Kolizja osiowa kręgosłupa (Przysiad i Martwy dzień po dniu - sprawdzanie priorytetów ORAZ ćwiczeń)
    let spinalCollisionDay: { d1: DayPlan; d2: DayPlan } | null = null;
    for (let i = 0; i < filteredDays.length - 1; i++) {
      const d1 = filteredDays[i];
      const d2 = filteredDays[i + 1];
      if (!d1.isRestDay && !d2.isRestDay) {
        const d1Squat = hasTerm(d1, ['przysiad', 'squat']);
        const d1Dead = hasTerm(d1, ['martwy', 'deadlift', 'rdl']);
        const d2Squat = hasTerm(d2, ['przysiad', 'squat']);
        const d2Dead = hasTerm(d2, ['martwy', 'deadlift', 'rdl']);

        if ((d1Squat && d2Dead) || (d1Dead && d2Squat)) {
          spinalCollisionDay = { d1, d2 };
          break;
        }
      }
    }

    if (spinalCollisionDay) {
      adviceList.push({
        id: 'spinal-compression',
        type: 'caution',
        title: `Przysiad i Martwy ciąg dzień po dniu (D${String(spinalCollisionDay.d1.dayNumber).padStart(2, '0')} i D${String(spinalCollisionDay.d2.dayNumber).padStart(2, '0')})`,
        rationale: 'Biomechanika obciążeń osiowych kręgosłupa (prof. Stuart McGill, 2007). Zarówno przysiad, jak i martwy ciąg generują ekstremalne siły kompresyjne i ścinające na prostowniki grzbietu oraz segment L4–S1. Zaplanowanie ich bezpośrednio dzień po dniu uniemożliwia pełną rehydratację pierścieni włóknistych krążków międzykręgowych. Zalecane minimum 48h przerwy lub dzień odpoczynku pomiędzy sesjami osiowymi.'
      });
    }

    // 4. Objętość serii na sesję i szacowany czas trwania sesji
    if (maxSetsDay && maxSetsDay.sets >= 20) {
      adviceList.push({
        id: 'high-session-volume',
        type: 'caution',
        title: `Wysoka objętość sesyjna (Dzień ${maxSetsDay.day.dayNumber}: aż ${maxSetsDay.sets} serii roboczych)`,
        rationale: 'Dynamika kortyzolu i glikolizy (Kraemer & Ratamess, 2005; Mike Israetel, 2019). Sesje siłowe przekraczające 20–22 serie robocze z ciężkimi wielostawami trwają zazwyczaj ponad 75–90 minut. Po tym czasie następuje gwałtowny spadek stężenia wolnego testosteronu przy wzroście poziomu kortyzolu, co obniża jakość skurczu w końcowych ćwiczeniach i wydłuża regenerację OUN.'
      });
    }

    // 5. Wysoka ekspozycja na obciążenie tricepsa i aparatu wyprostnego łokcia
    const tricepsDays = training.filter((d) => hasTerm(d, ['triceps', 'jm press', 'francuskie', 'dipy', 'prostowanie przedramion']));
    if (tricepsDays.length >= 4 && tricepsDays.length / (training.length || 1) >= 0.5) {
      adviceList.push({
        id: 'triceps-overload',
        type: 'warning',
        title: `Wysoka ekspozycja tricepsa (${tricepsDays.length} sesji / ${training.length} treningów = ${Math.round((tricepsDays.length / training.length) * 100)}%)`,
        rationale: 'Etiologia przeciążeń ścięgna mięśnia trójgłowego ramienia (Cook & Purdam, 2009). Triceps jest mocno obciążany jako główny synergista w każdym wyciskaniu (ławka, OHP, wąski chwyt, Spoto), a dołożenie bezpośrednich ruchów izolowanych (JM Press, wyciskanie francuskie, dipy) w ponad połowie sesji stwarza wysokie ryzyko entezo- i tendinopatii wyrostka łokciowego (olecranon).'
      });
    }

    // 6. Dysproporcja ramienia: Biceps vs Triceps
    const bicepsDays = training.filter((d) => hasTerm(d, ['biceps', 'uginanie']));
    if (training.length >= 6 && bicepsDays.length <= 1 && tricepsDays.length >= 4) {
      adviceList.push({
        id: 'biceps-deficit',
        type: 'info',
        title: `Znikoma objętość zginaczy ramienia (${bicepsDays.length} sesja bicepsa vs ${tricepsDays.length} tricepsa)`,
        rationale: 'Ko-kontrakcja i stabilizacja stawu łokciowego w trójboju (Dr. Stuart McGill; Greg Nuckols). Głowa długa dwugłowego ramienia stabilizuje torebkę stawową i głowę kości ramiennej podczas wyciskania leżąc. Brak bezpośredniej pracy zginaczy przy dominacji prostowników predysponuje do bólów łokci oraz ogranicza sztywność ramienia na ławce.'
      });
    }

    // 7. Specjalizacja benchowa i ochrona obręczy barkowej
    const benchDays = training.filter((d) => hasTerm(d, ['klatka', 'ławka', 'bench', 'spoto']));
    const rotatorDays = training.filter((d) => hasTerm(d, ['rotator', 'face pull', 'rotacje']));
    if (benchDays.length >= 4 && benchDays.length / (training.length || 1) >= 0.5) {
      if (rotatorDays.length >= 2) {
        adviceList.push({
          id: 'bench-specialization-safe',
          type: 'info',
          title: `Specjalizacja wyciskania (${benchDays.length} sesji) z aktywną protekcją rotatorów`,
          rationale: 'Zasada specyficzności adaptacyjnej (SAID) w trójboju (Zourdos et al., 2016). Wysoka częstotliwość wyciskania (3–4× w tygodniu) pozwala na maksymalizację koordynacji międzymięśniowej. Równoczesne wdrożenie Face Pulls i rotacji zewnętrznych chroni przed zespołem ciasnoty podbarkowej (impingement).'
        });
      } else {
        adviceList.push({
          id: 'bench-specialization-rotator-warn',
          type: 'warning',
          title: `Specjalizacja klatki (${benchDays.length} sesji) przy braku ochrony rotatorów`,
          rationale: 'Prewencja urazów pierścienia rotatorów (Kibler, 2013). Przy wysokiej częstotliwości wyciskania leżąc niezbędne jest wdrożenie rotacji zewnętrznych i retrakcji łopatek, aby zrównoważyć napięcie mięśnia podłopatkowego i piersiowego większego.'
        });
      }
    }

    // 8. Wykorzystanie serii Top Single (1x1) z autoregulacją RPE
    const hasTopSingles = training.some((d) =>
      d.exercises.some((e) => e.name.toLowerCase().includes('top single') || e.sets.includes('1x1'))
    );
    if (hasTopSingles) {
      adviceList.push({
        id: 'top-singles-rpe',
        type: 'info',
        title: 'Zastosowanie serii Top Single (1×1) z autoregulacją RPE',
        rationale: 'Powysiłkowe torowanie nerwowo-mięśniowe (PAP / PAPE, Tillin & Bishop, 2009; Helms, 2017). Wprowadzenie pojedynczej serii sub-maksymalnej (np. RPE 8) przed głównymi seriami roboczymi (3x3) zwiększa rekrutację jednostek motorycznych wysokoprogowych bez wywoływania zmęczenia metabolicznego, jednocześnie umożliwiając codzienną kalibrację 1RM.'
      });
    }

    // 9. Balans aparatu ruchu: Pchanie vs Ciągnięcie
    let pushCount = 0;
    let pullCount = 0;
    training.forEach((d) => {
      d.priorities.forEach((p) => {
        const lower = p.toLowerCase();
        if (lower.includes('klatka') || lower.includes('barki') || lower.includes('ohp') || lower.includes('triceps')) pushCount++;
        if (lower.includes('plecy') || lower.includes('martwy') || lower.includes('biceps') || lower.includes('wiosło') || lower.includes('rotator')) pullCount++;
      });
    });

    if (pushCount >= 4 && pullCount > 0 && pushCount / pullCount > 1.6) {
      adviceList.push({
        id: 'push-pull-balance',
        type: 'warning',
        title: `Dominacja pchania nad przyciąganiem (${pushCount} vs ${pullCount})`,
        rationale: 'Równowaga stawu ramienno-panewkowego (Sahrmann, 2002; Kibler, 2013). Nadmiar objętości wyciskania względem przyciągania predysponuje do protrakcji barków, zaburzenia rotacji łopatki oraz zespołu cieśni podbarkowej (impingement). Rekomendowany bezpieczny stosunek objętości to co najmniej 1:1 na korzyść partii grzbietowych.'
      });
    }

    // 10. Próg efektywnej objętości sesyjnej (Junk Volume po liczbie ćwiczeń)
    const overcrowdedDay = training.find((d) => d.exercises.length >= 7);
    if (overcrowdedDay) {
      adviceList.push({
        id: 'junk-volume',
        type: 'info',
        title: `Dzień ${overcrowdedDay.dayNumber}: aż ${overcrowdedDay.exercises.length} ćwiczeń w jednej sesji`,
        rationale: 'Próg efektywnej objętości sesyjnej (James Krieger, 2010; Mike Israetel, 2019). Powyżej 6–7 ćwiczeń drastycznie wzrasta zmęczenie OUN, podczas gdy odpowiedź hipertroficzna i siłowa kolejnych serii spada (tzw. junk volume). Warto rozważyć przeniesienie części akcesoriów na osobną lżejszą sesję.'
      });
    }

    // 11. Faza deloadu w długim cyklu
    if (total >= 21) {
      const hasDeloadOrLight = filteredDays.some((d) =>
        d.priorities.some((p) => p.toLowerCase().includes('lekko') || p.toLowerCase().includes('deload') || p.toLowerCase().includes('technika'))
      );
      if (!hasDeloadOrLight) {
        adviceList.push({
          id: 'deload-needed',
          type: 'info',
          title: `Cykl obejmuje ${total} dni bez zaplanowanego tygodnia deloadu`,
          rationale: 'Periodyzacja falowa i blokowa (Issurin, 2010; Stone, 2007). Po 3–4 tygodniach ciągłej akumulacji objętości dochodzi do desensytyzacji mechanoreceptorów mięśniowych. Faza deloadu (spadek objętości o 40–50% z zachowaniem intensywności) rozprasza zmęczenie i pozwala na pełne ujawnienie wzrostu siły (fitness-fatigue realization).'
        });
      }
    }

    return { total, trainingCount: training.length, restCount: rest.length, sorted, totalTags, exerciseCount, totalSets, primarySorted, adviceList };
  }, [filteredDays]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-start justify-center p-2.5 sm:px-4 sm:pt-[6vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[82vh]" onClick={(e) => e.stopPropagation()}>

        {/* Nagłówek */}
        <div className="flex items-center justify-between h-12 px-4 sm:px-5 border-b border-[var(--border-subtle)] shrink-0 gap-2">
          <span className="text-[12.5px] sm:text-[13px] font-semibold text-[var(--text-primary)] truncate">Raport i diagnostyka</span>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className="text-[10.5px] sm:text-[11px] bg-white/[0.04] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg px-2 sm:px-2.5 py-1 outline-none cursor-pointer focus:border-white/20 transition max-w-[130px] sm:max-w-none truncate"
            >
              {RANGE_OPTIONS.filter((r) => r.id === 'all' || program.days.length >= parseInt(r.id.replace('week', '')) * 7 - 6).map((r) => (
                <option key={r.id} value={r.id} className="bg-[#111318] text-[#e8e8ec]">{r.label}</option>
              ))}
            </select>
            <button type="button" onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">

          {/* Karty podsumowania */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {[
              { label: 'Dni w zakresie', value: stats.total },
              { label: 'Treningi', value: stats.trainingCount, accent: true },
              { label: 'Regeneracja', value: stats.restCount },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.02] border border-[var(--border-subtle)] rounded-xl p-2.5 sm:p-3 text-center">
                <div className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${s.accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                  {s.value}
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rozkład priorytetu #1 */}
          {stats.primarySorted.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Priorytet #1 — rozkład sesji</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{stats.trainingCount} sesji</span>
              </div>
              <div className="space-y-1.5">
                {stats.primarySorted.map(([tag, count]) => {
                  const pct = Math.round((count / (stats.trainingCount || 1)) * 100);
                  return (
                    <div key={tag} className="flex items-center gap-2.5">
                      <span className="text-[11px] text-[var(--text-primary)] w-28 truncate shrink-0">{tag}</span>
                      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)] w-14 text-right shrink-0">
                        {count}× ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rozkład wszystkich celów */}
          {stats.sorted.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Wszystkie cele treningowe</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{stats.totalTags} tagów</span>
              </div>
              <div className="space-y-1">
                {stats.sorted.map(([tag, count]) => {
                  const pct = Math.round((count / (stats.totalTags || 1)) * 100);
                  return (
                    <div key={tag} className="flex items-center gap-2.5">
                      <span className="text-[11px] text-[var(--text-secondary)] w-28 truncate shrink-0">{tag}</span>
                      <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/[0.2] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)] w-14 text-right shrink-0">
                        {count}× ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Licznik ćwiczeń i serii */}
          <div className="text-[11px] text-[var(--text-muted)] bg-white/[0.02] border border-[var(--border-subtle)] rounded-lg p-2.5 flex items-center justify-between">
            <span>Rozpisane ćwiczenia i serie</span>
            <span className="text-[var(--text-primary)] font-mono tabular-nums font-medium">
              {stats.exerciseCount} ćw. · {stats.totalSets} serii
            </span>
          </div>

          {/* Sekcja uwag i wskazówek trenerskich z naukowym wyjaśnieniem */}
          {stats.adviceList.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition w-full py-1"
              >
                <div className="flex items-center gap-1.5">
                  {showNotes ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500/80" />
                  <span className="font-medium">Wskazówki trenerskie i periodyzacja ({stats.adviceList.length})</span>
                </div>
                <span className="text-[10px] text-[var(--text-faint)]">Kliknij, aby rozwinąć</span>
              </button>

              {showNotes && (
                <div className="space-y-2 pt-1">
                  {stats.adviceList.map((advice) => {
                    const isExpanded = expandedRationaleId === advice.id;
                    return (
                      <div
                        key={advice.id}
                        className="bg-white/[0.02] border border-[var(--border-subtle)] rounded-xl p-3 space-y-2 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                            <span className="text-[11.5px] font-medium text-[var(--text-primary)] leading-snug">
                              {advice.title}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedRationaleId(isExpanded ? null : advice.id)}
                            className="shrink-0 text-[10px] flex items-center justify-center w-[72px] gap-1 px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors"
                            title="Wyjaśnienie naukowe i metodyczne"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>{isExpanded ? 'Zwiń' : 'Dlaczego?'}</span>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-elevated)] p-2.5 rounded-lg">
                            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-[var(--accent)] mb-1">
                              Uzasadnienie naukowe i trenerskie:
                            </div>
                            {advice.rationale}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Stopka */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[var(--border-subtle)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
