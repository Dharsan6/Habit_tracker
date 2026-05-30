import Card from "./Card.jsx";

export default function WeeklyProgressCard({ weeklyBreakdown, weeklyProgress }) {
  const maxCount = Math.max(...weeklyBreakdown.map((item) => item.count), 1);

  return (
    <Card className="rounded-[2rem] border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
            Weekly progress
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            {weeklyProgress}%
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Based on how many planned daily check-ins were completed over the last 7 days.
          </p>
        </div>
        <div className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          Last 7 days
        </div>
      </div>

      <div className="mt-8 grid grid-cols-7 gap-3">
        {weeklyBreakdown.map((day) => (
          <div key={day.label} className="flex flex-col items-center gap-3">
            <div className="flex h-32 items-end">
              <div className="flex h-full w-9 items-end rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                <div
                  className="w-full rounded-full bg-black transition-all duration-500 dark:bg-white"
                  style={{ height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 16 : 6)}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {day.label}
              </div>
              <div className="mt-1 text-sm font-semibold text-black dark:text-white">
                {day.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
