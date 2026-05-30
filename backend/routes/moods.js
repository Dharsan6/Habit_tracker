const router = require('express').Router();
const auth = require('../middleware/auth');
const Mood = require('../models/Mood');

// GET /api/moods?days=30
router.get('/', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceKey = since.toISOString().split('T')[0];

    const moods = await Mood.find({ userId: req.user.id, dateKey: { $gte: sinceKey } }).sort({ dateKey: -1 });
    res.json(moods.map(m => ({ id: m._id, moodValue: m.moodValue, dateKey: m.dateKey, notes: m.notes })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/moods  — upsert (one mood per day per user)
router.post('/', auth, async (req, res) => {
  try {
    const { moodValue, dateKey, notes } = req.body;
    if (!moodValue || !dateKey)
      return res.status(400).json({ error: 'moodValue and dateKey required' });

    const mood = await Mood.findOneAndUpdate(
      { userId: req.user.id, dateKey },
      { $set: { moodValue, notes: notes || '' } },
      { upsert: true, new: true }
    );
    res.status(200).json({ id: mood._id, moodValue: mood.moodValue, dateKey: mood.dateKey, notes: mood.notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
