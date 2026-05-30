const router = require('express').Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// GET /api/expenses
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json(expenses.map(e => ({ id: e._id, title: e.title, amount: e.amount, category: e.category, date: e.date, notes: e.notes })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    if (!title || !amount || !category || !date)
      return res.status(400).json({ error: 'title, amount, category, date are required' });
    const expense = await Expense.create({ userId: req.user.id, title, amount, category, date, notes: notes || '' });
    res.status(201).json({ id: expense._id, title: expense.title, amount: expense.amount, category: expense.category, date: expense.date, notes: expense.notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { title, amount, category, date, notes } },
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ id: expense._id, title: expense.title, amount: expense.amount, category: expense.category, date: expense.date, notes: expense.notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
