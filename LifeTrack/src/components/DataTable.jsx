import Card from "./Card.jsx";
import Button from "./Button.jsx";

export default function DataTable({
  columns,
  rows,
  keyField = "id",
  emptyMessage = "No data",
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300",
                    col.align === "right" ? "text-right" : "text-left",
                  ].join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-gray-600 dark:text-gray-300"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row[keyField]}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        "whitespace-nowrap px-6 py-4 text-sm text-black dark:text-white",
                        col.align === "right" ? "text-right" : "text-left",
                      ].join(" ")}
                    >
                      {typeof col.cell === "function" ? col.cell(row, { Button }) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
