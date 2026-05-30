export default function ProgressBar({
  value,
  max = 100,
  colorClassName = "bg-black dark:bg-white",
  trackClassName = "bg-gray-200 dark:bg-gray-700",
}) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className={["h-2 w-full overflow-hidden rounded-full", trackClassName].join(" ")}>
      <div
        className={["h-full transition-all duration-300", colorClassName].join(" ")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
