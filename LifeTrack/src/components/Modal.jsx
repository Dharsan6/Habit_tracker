export default function Modal({
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl shadow-slate-950/15 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/30">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
          ) : null}
        </div>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
