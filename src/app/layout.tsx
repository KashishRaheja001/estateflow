import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EstateFlow AI",
  description: "AI-Powered Real Estate Calling CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-neutral text-on-surface">
        <header className="border-b border-border/50 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="/" className="font-serif text-2xl tracking-tighter text-on-surface">EstateFlow AI</a>
            <nav className="flex items-center gap-8 font-medium text-sm">
              <a href="/" className="text-on-surface hover:text-primary transition-colors">Dashboard</a>
              <a href="/leads" className="text-on-surface hover:text-primary transition-colors">Leads</a>
              <a href="/properties" className="text-on-surface hover:text-primary transition-colors">Properties</a>
              <a href="/settings" className="text-on-surface hover:text-primary transition-colors">Settings</a>
            </nav>
            <div className="flex items-center">
              <a href="/leads" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-wide shadow-sm hover:opacity-90 transition-opacity">
                Start Calling
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          {children}
        </main>
        <SpeedInsights />
      </body>
    </html>
  );
}
