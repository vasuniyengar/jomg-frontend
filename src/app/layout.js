import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JOMG",
  description: "JOMG",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('jomg-theme') || 'dark';
    var p = localStorage.getItem('jomg-palette-' + t) || '';
    document.documentElement.setAttribute('data-theme', t);
    if (p) document.documentElement.setAttribute('data-palette', p);
    else document.documentElement.removeAttribute('data-palette');
  } catch (e) {}
})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
