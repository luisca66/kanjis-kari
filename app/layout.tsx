import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanji para Kari",
  description: "Aprende 175 kanjis del JLPT N5 y N4 con lecciones interactivas.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>漢</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
