'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProgress, markKanjiAsLearned as markLearned, resetProgress as reset } from './progress';

export function useProgress() {
  const [learnedIds, setLearnedIds] = useState<number[]>([]);

  useEffect(() => {
    setLearnedIds(getProgress());
  }, []);

  const markKanjiAsLearned = useCallback((id: number) => {
    markLearned(id);
    setLearnedIds(getProgress());
  }, []);

  const resetProgress = useCallback(() => {
    reset();
    setLearnedIds([]);
  }, []);

  const isKanjiLearned = useCallback((id: number) => {
    return learnedIds.includes(id);
  }, [learnedIds]);

  return { learnedIds, markKanjiAsLearned, resetProgress, isKanjiLearned };
}
