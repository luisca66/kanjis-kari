'use client';

export function speakJapanese(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';

  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice = voices.find(
    (v) => v.lang === 'ja-JP' || v.lang.startsWith('ja')
  );

  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  } else {
    // Si no hay voz japonesa, igual intentamos con el lang
    console.warn('No se encontró voz japonesa disponible');
  }

  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
