const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true, trim: true },
  amount:   { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  date:     { type: String, required: true },   // "YYYY-MM-DD"
  notes:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
