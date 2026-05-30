const router = require('express').Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

const Expense = require('../models/Expense');

// Helper to calculate spent for a category/month
async function calculateSpent(userId, category, month) {
  const expenses = await Expense.find({
    userId,
    category,
    date: { $regex: `^${month}` }
  });
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

// GET /api/budgets
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({ month: -1 });

    const enrichedBudgets = await Promise.all(budgets.map(async (b) => {
      const spent = await calculateSpent(req.user.id, b.category, b.month);
      return { id: b._id, category: b.category, limit: b.limit, spent, month: b.month };
    }));

    res.json(enrichedBudgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets
router.post('/', auth, async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    if (!category || !limit || !month)
      return res.status(400).json({ error: 'category, limit, month required' });
    
    const budget = await Budget.create({ userId: req.user.id, category, limit, spent: 0, month });
    const spent = await calculateSpent(req.user.id, category, month);
    
    res.status(201).json({ id: budget._id, category, limit, spent, month });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/budgets/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { category, limit, month } },
      { new: true }
    );
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    
    const spent = await calculateSpent(req.user.id, budget.category, budget.month);
    res.json({ id: budget._id, category: budget.category, limit: budget.limit, spent, month: budget.month });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
