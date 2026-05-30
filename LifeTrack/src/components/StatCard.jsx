import Card from "./Card.jsx";

export default function StatCard({ title, label, value, icon: Icon, hint, badge }) {
  const copy = title ?? label;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">{copy}</p>
            {badge ? (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
            {value}
          </p>
          {hint ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gray-100 text-black dark:bg-gray-800 dark:text-white">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
