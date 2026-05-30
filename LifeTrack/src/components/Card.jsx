export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={[
        "rounded-2xl border border-gray-200 bg-white text-black shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
