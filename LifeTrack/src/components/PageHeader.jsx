import Button from "./Button.jsx";

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  actionVariant = "primary",
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
        ) : null}
      </div>
      {actionLabel ? (
        <Button variant={actionVariant} onClick={onAction} className="w-full sm:w-auto">
          {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
