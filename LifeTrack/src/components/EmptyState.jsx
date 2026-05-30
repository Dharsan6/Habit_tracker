import { FiPlusCircle } from "react-icons/fi";

export default function EmptyState() {
  return (
    <section className="grid min-h-80 place-items-center rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="max-w-md space-y-4">
        <div className="mx-auto grid h-18 w-18 place-items-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <FiPlusCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            No habits yet
          </h2>
          <p className="leading-7 text-gray-600 dark:text-gray-300">
            Start with one repeatable action. Once you add a habit, weekly progress, streaks, and
            insights will show up here automatically.
          </p>
        </div>
      </div>
    </section>
  );
}
