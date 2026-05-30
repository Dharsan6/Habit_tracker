const filterOptions = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
];

const sortOptions = [
  { value: "name",        label: "Name"        },
  { value: "streak",      label: "Streak"      },
  { value: "consistency", label: "Consistency" },
];

export default function FilterSortBar({ filter, sortBy, onFilterChange, onSortChange, resultCount, totalCount }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: title + result count */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-black dark:text-white">Filter &amp; Sort</h2>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {resultCount} / {totalCount}
        </span>
      </div>

      {/* Right: controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter pill group */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                filter === option.value
                  ? "bg-black text-white shadow-sm dark:bg-white dark:text-black"
                  : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-black outline-none dark:text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
