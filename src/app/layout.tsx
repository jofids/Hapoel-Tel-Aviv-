import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predict Football",
  description: "Transparent football match prediction foundation"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {children}
            <footer className="border-t border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--muted)]">
              The system displays statistical predictions only. It is not possible to guarantee the
              outcome of a football match. Gambling may result in financial loss.
            </footer>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
