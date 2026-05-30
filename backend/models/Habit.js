const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:            { type: String, required: true, trim: true },
  category:        { type: String, default: 'General' },
  frequency:       { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], default: 'DAILY' },
  completionDates: [{ type: String }],   // ISO date strings "YYYY-MM-DD"
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
