'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import kanjiData from '@/data/kanji-data.json';
import { useProgress } from '@/lib/useProgress';
import { speakJapanese } from '@/lib/tts';
import type { Kanji, VocabularyEntry } from '@/types/kanji';

const HanziWriter = dynamic(() => import('@/components/HanziWriter'), { ssr: false });

const TOTAL_STEPS = 5;

// ── helpers ──────────────────────────────────────────────────────────────────

function getRandom<T>(arr: T[], count: number, exclude: T[]): T[] {
  const pool = arr.filter((x) => !exclude.includes(x));
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Popup kanji desconocido ───────────────────────────────────────────────────

function UnknownKanjiPopup({ kanji, onClose }: { kanji: string; onClose: () => void }) {
  const data = (kanjiData as Kanji[]).find((k) => k.kanji === kanji);
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-6xl text-center mb-4">{kanji}</div>
        {data ? (
          <>
            <p className="text-center text-gray-700 font-medium mb-1">{data.meanings.join(', ')}</p>
            {data.onyomi.length > 0 && <p className="text-center text-sm text-gray-500">On: {data.onyomi.join(', ')}</p>}
            {data.kunyomi.length > 0 && <p className="text-center text-sm text-gray-500">Kun: {data.kunyomi.join(', ')}</p>}
          </>
        ) : (
          <p className="text-center text-gray-500 text-sm">Kanji aún no en el curso</p>
        )}
        <button onClick={onClose} className="mt-4 w-full py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ── Furigana renderer ─────────────────────────────────────────────────────────

function FuriganaText({
  text,
  reading,
  unknownKanji = [],
  onUnknownClick,
}: {
  text: string;
  reading: string;
  unknownKanji?: string[];
  onUnknownClick?: (k: string) => void;
}) {
  const hasUnknown = text.split('').some((c) => unknownKanji.includes(c));

  if (!hasUnknown) {
    return (
      <ruby>
        {text}
        <rp>(</rp>
        <rt className="text-xs text-gray-400">{reading}</rt>
        <rp>)</rp>
      </ruby>
    );
  }

  return (
    <span className="inline-flex flex-wrap gap-0">
      {text.split('').map((char, i) => {
        const isUnknown = unknownKanji.includes(char);
        return (
          <span
            key={i}
            className={isUnknown ? 'text-amber-500 cursor-pointer hover:underline' : ''}
            onClick={isUnknown ? () => onUnknownClick?.(char) : undefined}
          >
            {char}
          </span>
        );
      })}
      <span className="text-xs text-gray-400 ml-1">({reading})</span>
    </span>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({
  kanjiId,
  totalKanjis,
  step,
  stepLabel,
  onSkip,
}: {
  kanjiId: number;
  totalKanjis: number;
  step: number;
  stepLabel: string;
  onSkip: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-8 text-sm text-gray-400">
      <div>
        <span className="font-medium text-gray-600">Kanji {kanjiId}</span>
        <span> de {totalKanjis}</span>
        <span className="mx-2">·</span>
        <span>Paso {step} de {TOTAL_STEPS}: {stepLabel}</span>
      </div>
      <button onClick={onSkip} className="text-xs hover:text-gray-600 transition-colors">
        Saltar al paso siguiente →
      </button>
    </div>
  );
}

// ── Step 1: Presentación ──────────────────────────────────────────────────────

function StepPresentacion({ kanji, onNext }: { kanji: Kanji; onNext: () => void }) {
  return (
    <div>
      <div className="text-center mb-10">
        <div className="text-9xl mb-6 leading-none">{kanji.kanji}</div>
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto text-left mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Significado</div>
            <div className="text-lg font-medium">{kanji.meanings.join(', ')}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Lecturas</div>
            {kanji.onyomi.length > 0 && (
              <div className="mb-1">
                <span className="text-xs text-gray-400 mr-1">On:</span>
                <span className="font-medium">{kanji.onyomi.join('、')}</span>
              </div>
            )}
            {kanji.kunyomi.length > 0 && (
              <div>
                <span className="text-xs text-gray-400 mr-1">Kun:</span>
                <span className="font-medium">{kanji.kunyomi.join('、')}</span>
              </div>
            )}
          </div>
        </div>

        {kanji.radicals.length > 0 && (
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Radicales</div>
            <div className="flex justify-center gap-2 flex-wrap">
              {kanji.radicals.map((r) => (
                <span key={r} className="px-3 py-1 border border-gray-200 rounded-full text-sm">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto text-left border-l-4 border-gray-200 pl-4 text-gray-600 italic">
          {kanji.mnemonic}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Siguiente: Orden de trazos →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Trazos ────────────────────────────────────────────────────────────

function StepTrazos({ kanji, onNext, onBack }: { kanji: Kanji; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <div className="flex flex-col items-center mb-10">
        <HanziWriter character={kanji.kanji} />
        <p className="text-sm text-gray-400 mt-4">Trazos: {kanji.strokeCount}</p>
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          ← Atrás
        </button>
        <button onClick={onNext} className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors">
          Siguiente: Práctica del kanji →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Quiz kanji ────────────────────────────────────────────────────────

type QuizQuestion = {
  type: 'significado' | 'onyomi' | 'kunyomi' | 'visual';
  prompt: string;
  options: string[];
  correct: string;
};

function buildKanjiQuiz(kanji: Kanji, allKanjis: Kanji[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Q1: Significado
  const otherMeanings = allKanjis
    .filter((k) => k.id !== kanji.id)
    .map((k) => k.meanings[0]);
  const meaningOptions = shuffle([
    kanji.meanings[0],
    ...getRandom(otherMeanings, 3, [kanji.meanings[0]]),
  ]);
  questions.push({
    type: 'significado',
    prompt: `¿Qué significa ${kanji.kanji}?`,
    options: meaningOptions,
    correct: kanji.meanings[0],
  });

  // Q2: On'yomi
  if (kanji.onyomi.length > 0) {
    const otherOn = allKanjis
      .filter((k) => k.id !== kanji.id && k.onyomi.length > 0)
      .map((k) => k.onyomi[0]);
    const onOptions = shuffle([
      kanji.onyomi[0],
      ...getRandom(otherOn, 3, [kanji.onyomi[0]]),
    ]);
    questions.push({
      type: 'onyomi',
      prompt: `¿Cuál es la lectura on'yomi de ${kanji.kanji}?`,
      options: onOptions,
      correct: kanji.onyomi[0],
    });
  }

  // Q3: Kun'yomi
  if (kanji.kunyomi.length > 0) {
    const otherKun = allKanjis
      .filter((k) => k.id !== kanji.id && k.kunyomi.length > 0)
      .map((k) => k.kunyomi[0]);
    const kunOptions = shuffle([
      kanji.kunyomi[0],
      ...getRandom(otherKun, 3, [kanji.kunyomi[0]]),
    ]);
    questions.push({
      type: 'kunyomi',
      prompt: `¿Cuál es la lectura kun'yomi de ${kanji.kanji}?`,
      options: kunOptions,
      correct: kanji.kunyomi[0],
    });
  }

  // Q4: Visual
  const otherKanjis = allKanjis
    .filter((k) => k.id !== kanji.id)
    .map((k) => k.kanji);
  const visualOptions = shuffle([
    kanji.kanji,
    ...getRandom(otherKanjis, 3, [kanji.kanji]),
  ]);
  questions.push({
    type: 'visual',
    prompt: `¿Cuál es el kanji para "${kanji.meanings[0]}"?`,
    options: visualOptions,
    correct: kanji.kanji,
  });

  return questions;
}

function QuizView({
  questions,
  onFinish,
  onBack,
  nextLabel,
}: {
  questions: QuizQuestion[];
  onFinish: () => void;
  onBack: () => void;
  nextLabel: string;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div>
      <div className="mb-2 text-xs text-gray-400">
        Pregunta {currentQ + 1} de {questions.length}
      </div>
      <p className="text-xl font-semibold mb-6">{question.prompt}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {question.options.map((opt) => {
          let cls = 'px-4 py-4 rounded-xl border text-lg transition-colors cursor-pointer text-center ';
          if (!answered) {
            cls += 'border-gray-200 hover:border-gray-400 hover:bg-gray-50';
          } else if (opt === question.correct) {
            cls += 'border-emerald-500 bg-emerald-50 text-emerald-700';
          } else if (opt === selected) {
            cls += 'border-red-400 bg-red-50 text-red-700';
          } else {
            cls += 'border-gray-100 text-gray-300';
          }
          return (
            <button key={opt} className={cls} onClick={() => handleSelect(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mb-4 text-sm">
          {selected === question.correct ? (
            <span className="text-emerald-600 font-medium">✓ ¡Correcto!</span>
          ) : (
            <span className="text-red-600">La respuesta correcta era: <strong>{question.correct}</strong></span>
          )}
        </div>
      )}

      <div className="flex justify-between">
        {currentQ === 0 ? (
          <button onClick={onBack} className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            ← Atrás
          </button>
        ) : (
          <div />
        )}
        {answered && (
          <button onClick={handleNext} className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors">
            {isLast ? nextLabel : 'Siguiente pregunta →'}
          </button>
        )}
      </div>
    </div>
  );
}

function StepQuizKanji({ kanji, allKanjis, onNext, onBack }: { kanji: Kanji; allKanjis: Kanji[]; onNext: () => void; onBack: () => void }) {
  const [questions] = useState(() => buildKanjiQuiz(kanji, allKanjis));
  return (
    <QuizView
      questions={questions}
      onFinish={onNext}
      onBack={onBack}
      nextLabel="Siguiente: Vocabulario →"
    />
  );
}

// ── Step 4: Vocabulario ───────────────────────────────────────────────────────

function VocabCard({
  entry,
}: {
  entry: VocabularyEntry;
  allKanjis?: Kanji[];
}) {
  const [popup, setPopup] = useState<string | null>(null);

  return (
    <div className="border border-gray-100 rounded-2xl p-6 mb-4">
      {popup && <UnknownKanjiPopup kanji={popup} onClose={() => setPopup(null)} />}

      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-4xl mb-1">
            <FuriganaText
              text={entry.word}
              reading={entry.reading}
              unknownKanji={entry.containsUnknownKanji}
              onUnknownClick={setPopup}
            />
          </div>
          <div className="text-gray-600 font-medium">{entry.meaning}</div>
        </div>
        <button
          onClick={() => speakJapanese(entry.word)}
          className="text-2xl hover:scale-110 transition-transform"
          title="Escuchar palabra"
        >
          🔊
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-gray-700 text-sm">
              <FuriganaText
                text={entry.example}
                reading={entry.exampleReading}
                unknownKanji={entry.containsUnknownKanji}
                onUnknownClick={setPopup}
              />
            </div>
            <div className="text-gray-400 text-sm mt-1">{entry.exampleTranslation}</div>
          </div>
          <button
            onClick={() => speakJapanese(entry.example)}
            className="text-lg hover:scale-110 transition-transform flex-shrink-0"
            title="Escuchar oración"
          >
            🔊
          </button>
        </div>
      </div>
    </div>
  );
}

function StepVocabulario({ kanji, allKanjis, onNext, onBack }: { kanji: Kanji; allKanjis: Kanji[]; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">Palabras que usan <strong>{kanji.kanji}</strong>:</p>
      {kanji.vocabulary.map((entry, i) => (
        <VocabCard key={i} entry={entry} allKanjis={allKanjis} />
      ))}
      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          ← Atrás
        </button>
        <button onClick={onNext} className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors">
          Siguiente: Práctica del vocabulario →
        </button>
      </div>
    </div>
  );
}

// ── Step 5: Quiz vocabulario ──────────────────────────────────────────────────

function buildVocabQuiz(kanji: Kanji, allKanjis: Kanji[]): QuizQuestion[] {
  const allMeanings = allKanjis.flatMap((k) => k.vocabulary.map((v) => v.meaning));
  const allWords = allKanjis.flatMap((k) => k.vocabulary.map((v) => v.word));
  const questions: QuizQuestion[] = [];

  for (const entry of kanji.vocabulary) {
    // Q1: Palabra → significado
    const meanDistractors = getRandom(allMeanings, 3, [entry.meaning]);
    questions.push({
      type: 'significado',
      prompt: `¿Qué significa "${entry.word}" (${entry.reading})?`,
      options: shuffle([entry.meaning, ...meanDistractors]),
      correct: entry.meaning,
    });

    // Q2: Significado → palabra
    const wordDistractors = getRandom(allWords, 3, [entry.word]);
    questions.push({
      type: 'visual',
      prompt: `¿Cuál es la palabra para "${entry.meaning}"?`,
      options: shuffle([entry.word, ...wordDistractors]),
      correct: entry.word,
    });
  }

  return questions;
}

function StepQuizVocab({
  kanji,
  allKanjis,
  onFinish,
  onBack,
}: {
  kanji: Kanji;
  allKanjis: Kanji[];
  onFinish: () => void;
  onBack: () => void;
}) {
  const [questions] = useState(() => buildVocabQuiz(kanji, allKanjis));
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">¡Lección completada!</h2>
        <p className="text-gray-500 mb-8">
          Aprendiste el kanji <strong>{kanji.kanji}</strong> y {kanji.vocabulary.length} palabras nuevas.
        </p>
        <button
          onClick={onFinish}
          className="bg-emerald-500 text-white text-lg px-8 py-4 rounded-xl hover:bg-emerald-600 transition-colors mb-4 block w-full"
        >
          Marcar como aprendido y continuar →
        </button>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <QuizView
      questions={questions}
      onFinish={() => setDone(true)}
      onBack={onBack}
      nextLabel="Ver resultados"
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const STEP_LABELS = [
  'Presentación',
  'Orden de trazos',
  'Práctica del kanji',
  'Vocabulario',
  'Práctica del vocabulario',
];

export default function LeccionPage() {
  const params = useParams();
  const router = useRouter();
  const { markKanjiAsLearned } = useProgress();
  const [step, setStep] = useState(1);

  const id = Number(params.id);
  const allKanjis = kanjiData as Kanji[];
  const kanji = allKanjis.find((k) => k.id === id);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleFinish = useCallback(() => {
    markKanjiAsLearned(id);
    const nextId = id + 1;
    const nextKanji = allKanjis.find((k) => k.id === nextId);
    if (nextKanji) {
      router.push(`/leccion/${nextId}`);
    } else {
      router.push('/');
    }
  }, [id, allKanjis, markKanjiAsLearned, router]);

  if (!kanji) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Kanji no encontrado</h1>
        <p className="text-gray-500 mb-6">El kanji con ID {id} no existe en el curso.</p>
        <Link href="/" className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Inicio
          </Link>
        </div>

        <StepIndicator
          kanjiId={id}
          totalKanjis={allKanjis.length}
          step={step}
          stepLabel={STEP_LABELS[step - 1]}
          onSkip={() => setStep((s) => Math.min(s + 1, TOTAL_STEPS))}
        />

        {/* Step progress dots */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-emerald-500' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        {step === 1 && (
          <StepPresentacion kanji={kanji} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepTrazos kanji={kanji} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <StepQuizKanji
            kanji={kanji}
            allKanjis={allKanjis}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepVocabulario
            kanji={kanji}
            allKanjis={allKanjis}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <StepQuizVocab
            kanji={kanji}
            allKanjis={allKanjis}
            onFinish={handleFinish}
            onBack={() => setStep(4)}
          />
        )}
      </div>
    </div>
  );
}
