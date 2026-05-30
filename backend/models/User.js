const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  username:   { type: String, required: true, unique: true, trim: true, lowercase: true },
  email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
