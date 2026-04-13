const STORAGE_KEY = 'kanji-progress';

export function getProgress(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markKanjiAsLearned(id: number): void {
  const progress = getProgress();
  if (!progress.includes(id)) {
    progress.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

export function isKanjiLearned(id: number): boolean {
  return getProgress().includes(id);
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
