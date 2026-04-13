# Kanji para Kari

Aplicación web para aprender los 180 primeros kanjis del JLPT N5 con lecciones interactivas.

## Cómo correr en local

```bash
cd kanji-app
npm install
npm run dev
```

Luego abre http://localhost:3000 en tu navegador.

## Cómo agregar más kanjis

Edita el archivo `data/kanji-data.json`. Cada kanji tiene: `id`, `kanji`, `meanings`, `onyomi`, `kunyomi`, `radicals`, `strokeCount`, `mnemonic` y `vocabulary` (array con oraciones de ejemplo).

## Despliegue en Vercel

1. Sube el proyecto a GitHub
2. En vercel.com → "Add New Project" → importa el repo
3. Vercel detecta Next.js automáticamente. Cada `git push` despliega solo.

## Notas

- Progreso guardado en `localStorage`. Si Kari cambia de navegador, se pierde.
- Animación de trazos con `hanzi-writer` (compatible con kanji japonés).
- Audio via Web Speech API con voz japonesa del sistema.
