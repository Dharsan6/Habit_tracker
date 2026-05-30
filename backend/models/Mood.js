const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moodValue:  { type: String, required: true },   // e.g. "happy", "sad", etc.
  dateKey:    { type: String, required: true },    // "YYYY-MM-DD"
  notes:      { type: String, default: '' },
}, { timestamps: true });

// One mood per user per day
moodSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('Mood', moodSchema);
