import { useEffect, useState, useCallback } from "react";
import { FiAlertCircle, FiEdit2, FiLoader, FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatCard from "../components/StatCard.jsx";
import Modal from "../components/Modal.jsx";
import formatINR from "../utils/formatCurrency";
import { api } from "../utils/api.js";

const CATEGORIES = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Health", "Education", "Other"];

const currentMonthStr = () => new Date().toISOString().slice(0, 7);

const emptyForm = () => ({
  category: "",
  limit: "",
  month: currentMonthStr(),
});

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const fetchBudgets = useCallback(async () => {
    try {
      const [budData, expData] = await Promise.all([
        api.get("/budgets"),
        api.get("/expenses")
      ]);
      setBudgets(Array.isArray(budData) ? budData : []);
      setExpenses(Array.isArray(expData) ? expData : []);
    } catch {
      // Backend offline — use mock data
      setBudgets([
        { id: 1, category: "Food", limit: 5000, spent: 3200, month: currentMonthStr() },
        { id: 2, category: "Transport", limit: 2000, spent: 1450, month: currentMonthStr() },
        { id: 3, category: "Entertainment", limit: 1000, spent: 950, month: currentMonthStr() },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const openAdd = () => { setEditTarget(null); setFormData(emptyForm()); setShowModal(true); };
  const openEdit = (b) => {
    setEditTarget(b);
    setFormData({ category: b.category, limit: String(b.limit), month: b.month });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) return;
    const payload = { ...formData, limit: parseFloat(formData.limit) };

    if (editTarget) {
      try {
        await api.put(`/budgets/${editTarget.id}`, payload);
      } catch {}
      setBudgets((prev) => prev.map((b) => b.id === editTarget.id ? { ...b, ...payload } : b));
    } else {
      let created;
      try {
        created = await api.post("/budgets", payload);
      } catch {
        created = { id: Date.now(), ...payload, spent: 0 };
      }
      setBudgets((prev) => [...prev, created]);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = async (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    setDeleteTarget(null);
    api.delete(`/budgets/${id}`).catch(() => {});
  };

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const remaining = totalLimit - totalSpent;

  const getPct = (b) => b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
  const getColor = (b) => {
    const p = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
    if (p >= 90) return "bg-red-500";
    if (p >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const inputCls = "mt-1 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-black outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        subtitle="Manage your monthly spending limits"
        actionLabel="Add Budget"
        actionIcon={FiPlus}
        onAction={openAdd}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total budget" value={formatINR(totalLimit)} />
        <StatCard label="Total spent" value={formatINR(totalSpent)} />
        <StatCard label="Remaining" value={formatINR(remaining)} />
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <FiLoader className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">No budgets yet. Add one to start tracking.</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const pct = getPct(budget);
              const isOver = budget.spent > budget.limit;
              return (
                <Card key={budget.id} className={`p-6 transition-all duration-300 ${expandedId === budget.id ? 'ring-2 ring-black dark:ring-white' : ''}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{budget.category}</h3>
                    <div className="flex items-center gap-1.5">
                      {isOver && <FiAlertCircle className="h-4 w-4 text-red-500" title="Over budget" />}
                      <button type="button" onClick={() => openEdit(budget)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white">
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(budget)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950">
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatINR(budget.spent ?? 0)} / {formatINR(budget.limit)}
                    </span>
                    <span className="text-sm font-semibold text-black dark:text-white">{pct.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={pct} max={100} colorClassName={getColor(budget)} />
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{budget.month}</span>
                    <span className={isOver ? "font-semibold text-red-500" : "font-medium text-emerald-600 dark:text-emerald-400"}>
                      {isOver ? `₹${Math.abs(budget.limit - budget.spent).toLocaleString()} over` : `₹${(budget.limit - budget.spent).toLocaleString()} left`}
                    </span>
                  </div>

                  {/* Expense Breakdown Trigger */}
                  <button 
                    onClick={() => setExpandedId(expandedId === budget.id ? null : budget.id)}
                    className="mt-4 w-full py-2 border-t border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition flex items-center justify-center gap-2"
                  >
                    {expandedId === budget.id ? "Hide breakdown" : "View related expenses"}
                  </button>

                  {/* Expense List */}
                  {expandedId === budget.id && (
                    <div className="mt-3 space-y-2 border-t border-gray-50 pt-3 dark:border-gray-800 animate-in fade-in slide-in-from-top-1">
                      {expenses
                        .filter(e => e.category === budget.category && e.date.startsWith(budget.month))
                        .map(e => (
                          <div key={e.id} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{e.title}</span>
                            <span className="font-medium text-black dark:text-white">{formatINR(e.amount)}</span>
                          </div>
                        ))}
                      {expenses.filter(e => e.category === budget.category && e.date.startsWith(budget.month)).length === 0 && (
                        <p className="text-[10px] text-center text-gray-400 italic">No expenses recorded for this budget yet.</p>
                      )}
                    </div>
                  )}

                  {isOver && !expandedId && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                      Limit exceeded. Consider increasing this budget or reducing spend.
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
              {editTarget ? "Edit budget" : "Add new budget"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white">Monthly limit (₹)</label>
                <input type="number" step="0.01" min="1" value={formData.limit} onChange={(e) => setFormData({ ...formData, limit: e.target.value })} placeholder="5000" className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white">Month</label>
                <input type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className={inputCls} required />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={() => setShowModal(false)} variant="secondary" className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">{editTarget ? "Save changes" : "Add Budget"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        title="Delete budget?"
        description={deleteTarget ? `The budget for "${deleteTarget.category}" (${deleteTarget.month}) will be permanently deleted.` : ""}
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
