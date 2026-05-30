import { useEffect, useState, useCallback } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiLoader } from "react-icons/fi";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import Modal from "../components/Modal.jsx";
import formatINR from "../utils/formatCurrency";
import { api } from "../utils/api.js";

const CATEGORIES = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Health", "Education", "Other"];

const emptyForm = () => ({
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().split("T")[0],
  notes: "",
});

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [budgets, setBudgets] = useState([]);

  const fetchExpenses = useCallback(async () => {
    try {
      const [expData, budData] = await Promise.all([
        api.get("/expenses"),
        api.get("/budgets")
      ]);
      setExpenses(Array.isArray(expData) ? expData : []);
      setBudgets(Array.isArray(budData) ? budData : []);
    } catch {
      // Backend offline — keep mock data
      setExpenses([
        { id: 1, title: "Groceries", amount: 1500, category: "Food", date: "2026-05-01", notes: "" },
        { id: 2, title: "Bus pass", amount: 500, category: "Transport", date: "2026-05-02", notes: "" },
        { id: 3, title: "Netflix", amount: 649, category: "Entertainment", date: "2026-05-03", notes: "" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const openAdd = () => { setEditTarget(null); setFormData(emptyForm()); setShowModal(true); };
  const openEdit = (row) => {
    setEditTarget(row);
    setFormData({ title: row.title, amount: String(row.amount), category: row.category, date: row.date, notes: row.notes || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    const payload = { ...formData, amount: parseFloat(formData.amount) };

    try {
      if (editTarget) {
        const updated = await api.put(`/expenses/${editTarget.id}`, payload).catch(() => ({ ...editTarget, ...payload }));
        setExpenses((prev) => prev.map((x) => x.id === editTarget.id ? { ...x, ...payload } : x));
      } else {
        const created = await api.post("/expenses", payload).catch(() => ({ id: Date.now(), ...payload }));
        setExpenses((prev) => [created, ...prev]);
      }
    } catch {
      // handled inside
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = async (id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
    setDeleteTarget(null);
    api.delete(`/expenses/${id}`).catch(() => {});
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthExp = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const totalThisMonth = thisMonthExp.reduce((s, e) => s + e.amount, 0);
  const topCategory = (() => {
    const map = new Map();
    thisMonthExp.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    let best = { category: "—", amount: -1 };
    for (const [cat, amt] of map) if (amt > best.amount) best = { category: cat, amount: amt };
    return best.category;
  })();

  const columns = [
    { key: "date", header: "Date", cell: (r) => new Date(r.date).toLocaleDateString() },
    { key: "title", header: "Title" },
    {
      key: "category", header: "Category",
      cell: (r) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-black dark:bg-gray-800 dark:text-white">
          {r.category}
        </span>
      ),
    },
    { key: "amount", header: "Amount", align: "right", cell: (r) => formatINR(r.amount) },
    {
      key: "actions", header: "Actions", align: "right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="px-2 py-2" type="button" onClick={() => openEdit(r)}>
            <FiEdit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-2 text-red-500" type="button" onClick={() => setDeleteTarget(r)}>
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const inputCls = "mt-1 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-black outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Track and manage your spending"
        actionLabel="Add Expense"
        actionIcon={FiPlus}
        onAction={openAdd}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total expenses" value={formatINR(total)} />
        <StatCard label="This month" value={formatINR(totalThisMonth)} />
        <StatCard label="Top category" value={topCategory} />
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <FiLoader className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <DataTable columns={columns} rows={expenses} keyField="id" emptyMessage="No expenses yet — add one!" />
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
              {editTarget ? "Edit expense" : "Add new expense"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Title", field: "title", type: "text", placeholder: "e.g., Groceries" },
                { label: "Amount (₹)", field: "amount", type: "number", placeholder: "0.00", extra: { step: "0.01", min: "0" } },
              ].map(({ label, field, type, placeholder, extra = {} }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-black dark:text-white">{label}</label>
                  <input
                    type={type}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={placeholder}
                    className={inputCls}
                    required
                    {...extra}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-black dark:text-white">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                {/* Budget Status Indicator */}
                {(() => {
                  const currentMonth = formData.date.slice(0, 7);
                  const budget = budgets.find(b => b.category === formData.category && b.month === currentMonth);
                  
                  // Calculate local spent for this category/month from the expenses state for immediate feedback
                  const localSpent = expenses
                    .filter(e => e.category === formData.category && e.date.startsWith(currentMonth))
                    .reduce((sum, e) => sum + e.amount, 0);

                  if (!budget) {
                    return localSpent > 0 ? (
                      <p className="mt-1.5 text-xs font-semibold text-gray-500">
                        Spent this month: {formatINR(localSpent)} (No budget set)
                      </p>
                    ) : null;
                  }

                  const remaining = budget.limit - localSpent;
                  const isOver = remaining < 0;
                  return (
                    <p className={`mt-1.5 text-xs font-semibold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Budget: {formatINR(localSpent)} / {formatINR(budget.limit)} 
                      ({isOver ? `${formatINR(Math.abs(remaining))} over` : `${formatINR(remaining)} left`})
                    </p>
                  );
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white">Notes (optional)</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any note…" className={inputCls} />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={() => setShowModal(false)} variant="secondary" className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">{editTarget ? "Save changes" : "Add Expense"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        title="Delete expense?"
        description={deleteTarget ? `"${deleteTarget.title}" (${formatINR(deleteTarget.amount)}) will be permanently removed.` : ""}
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <button
              type="button"
              onClick={() => handleDelete(deleteTarget.id)}
              className="rounded-[1.25rem] bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete
            </button>
          </>
        }
      />
    </div>
  );
}
