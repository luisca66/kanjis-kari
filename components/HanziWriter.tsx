'use client';

import { useEffect, useRef, useState } from 'react';

interface HanziWriterProps {
  character: string;
}

export default function HanziWriterComponent({ character }: HanziWriterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<unknown>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    async function init() {
      try {
        const HanziWriter = (await import('hanzi-writer')).default;
        if (cancelled || !containerRef.current) return;

        // Clear any previous instance
        containerRef.current.innerHTML = '';

        const writer = HanziWriter.create(containerRef.current, character, {
          width: 300,
          height: 300,
          padding: 20,
          strokeColor: '#1f2937',
          highlightColor: '#10b981',
          outlineColor: '#e5e7eb',
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 100,
        });

        writerRef.current = writer;
        writer.animateCharacter();
      } catch {
        if (!cancelled) setError(true);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [character]);

  const handleAnimate = () => {
    if (writerRef.current) {
      (writerRef.current as { animateCharacter: () => void }).animateCharacter();
    }
  };

  const handleShowFull = () => {
    if (writerRef.current) {
      (writerRef.current as { showCharacter: () => void }).showCharacter();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-[300px] h-[300px] flex items-center justify-center text-[180px] border border-gray-200 rounded-xl bg-gray-50">
          {character}
        </div>
        <p className="text-sm text-gray-400">Animación no disponible para este kanji</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-xl bg-gray-50"
        style={{ width: 300, height: 300 }}
      />
      <div className="flex gap-3">
        <button
          onClick={handleAnimate}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          ▶ Reproducir
        </button>
        <button
          onClick={handleShowFull}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          ⏭ Mostrar completo
        </button>
      </div>
    </div>
  );
}
