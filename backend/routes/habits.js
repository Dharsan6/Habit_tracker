const router = require('express').Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');

// GET /api/habits  — list all habits for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    // Shape matches what the React frontend expects
    res.json(habits.map(h => ({
      id: h._id,
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      completionDates: h.completionDates,
      createdAt: h.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits
router.post('/', auth, async (req, res) => {
  try {
    const { name, title, category, frequency } = req.body;
    const finalName = name || title;
    if (!finalName) return res.status(400).json({ error: 'Name or title is required' });
    const habit = await Habit.create({
      userId: req.user.id,
      name: finalName,
      category: category || 'General',
      frequency: frequency || 'DAILY',
      completionDates: [],
    });
    res.status(201).json({ id: habit._id, name: habit.name, category: habit.category, frequency: habit.frequency, completionDates: [], createdAt: habit.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/habits/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, title, category, frequency } = req.body;
    const finalName = name || title;
    const updates = { category, frequency };
    if (finalName) updates.name = finalName;

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true }
    );
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json({ id: habit._id, name: habit.name, category: habit.category, frequency: habit.frequency, completionDates: habit.completionDates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits/:id/toggle  — toggle completion for a specific date
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const { date } = req.body;  // "YYYY-MM-DD"
    if (!date) return res.status(400).json({ error: 'date is required' });

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const idx = habit.completionDates.indexOf(date);
    if (idx === -1) {
      habit.completionDates.push(date);
    } else {
      habit.completionDates.splice(idx, 1);
    }
    await habit.save();
    res.json({ id: habit._id, completionDates: habit.completionDates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
