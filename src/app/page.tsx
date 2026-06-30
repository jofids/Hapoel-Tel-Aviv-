import { getRuntimeMode } from "@/lib/config/runtime-mode";

export default function HomePage() {
  const mode = getRuntimeMode();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <p className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          {mode.isDemoMode ? "Demo Mode – Data is not live" : "Live Mode"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Predict Football</h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
          בסיס נתונים ולוגיקת חיזוי שקופה למשחקי כדורגל. גרסת Part 1 כוללת סכמת DB, ספקי
          נתונים, מנוע Poisson, odds blending, מדדי ביטחון והסברים.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[
          "PostgreSQL + Prisma schema",
          "Provider adapters for demo and live data",
          "Poisson prediction engine",
          "Odds conversion and blended probabilities",
          "Confidence and data-quality scoring",
          "Explanation engine from actual factors"
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="font-medium">{item}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
