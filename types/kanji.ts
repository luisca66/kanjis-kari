export interface VocabularyEntry {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  exampleReading: string;
  exampleTranslation: string;
  containsUnknownKanji: string[];
}

export interface Kanji {
  id: number;
  kanji: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  radicals: string[];
  strokeCount: number;
  mnemonic: string;
  vocabulary: VocabularyEntry[];
}
