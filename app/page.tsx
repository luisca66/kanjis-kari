'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProgress } from '@/lib/useProgress';
import kanjiData from '@/data/kanji-data.json';

const TOTAL_KANJIS = 180;

export default function HomePage() {
  const { learnedIds, resetProgress } = useProgress();
  const [showLearned, setShowLearned] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const learned = learnedIds.length;
  const progress = (learned / TOTAL_KANJIS) * 100;

  const allKanjiIds = kanjiData.map((k) => k.id);
  const firstUnlearned = allKanjiIds.find((id) => !learnedIds.includes(id));
  const allDone = learned >= TOTAL_KANJIS;

  const handleReset = () => {
    if (confirm('¿Seguro que quieres reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
      resetProgress();
    }
  };

  const learnedKanjis = kanjiData.filter((k) => learnedIds.includes(k.id));

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      <div className="w-full max-w-xl text-center">
        <div className="mb-2 text-6xl">漢</div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Kanji para Kari</h1>
        <p className="text-gray-500 mb-10">180 kanjis del JLPT N5 · Lección por lección</p>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{learned} de {TOTAL_KANJIS} kanjis aprendidos</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {allDone ? (
          <div className="text-2xl font-semibold text-emerald-600">
            🎉 ¡Completado! Has aprendido todos los kanjis.
          </div>
        ) : (
          <Link
            href={`/leccion/${firstUnlearned ?? 1}`}
            className="inline-block bg-gray-900 text-white text-lg font-medium px-10 py-4 rounded-xl hover:bg-gray-700 transition-colors"
          >
            {learned === 0 ? 'Empezar' : 'Continuar'}
          </Link>
        )}

        {learned > 0 && (
          <div className="mt-12 text-left">
            <button
              onClick={() => setShowLearned(!showLearned)}
              className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
            >
              <span>{showLearned ? '▾' : '▸'}</span>
              <span>Kanjis aprendidos ({learned})</span>
            </button>
            {showLearned && (
              <div className="mt-4 grid grid-cols-8 gap-2">
                {learnedKanjis.map((k) => (
                  <Link
                    key={k.id}
                    href={`/leccion/${k.id}`}
                    className="aspect-square flex items-center justify-center text-2xl border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                    title={k.meanings.join(', ')}
                  >
                    {k.kanji}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleReset}
        className="fixed bottom-6 right-6 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        Reiniciar progreso
      </button>
    </main>
  );
}
