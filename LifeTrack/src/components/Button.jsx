export default function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-black text-white hover:bg-gray-800 focus:ring-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:focus:ring-gray-700",
    secondary:
      "border border-gray-200 bg-white text-black hover:bg-gray-100 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 dark:focus:ring-gray-700",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-black focus:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-gray-700",
    danger:
      "bg-black text-white hover:bg-gray-800 focus:ring-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const cls = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Comp className={cls} {...props}>
      {children}
    </Comp>
  );
}
