const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['workout', 'diet'], required: true },
  title: { type: String, required: true },
  status: { type: Boolean, default: false },
  timing: { type: String, enum: ['morning', 'afternoon', 'night', 'snacks', ''], default: '' },
  grams: { type: Number, default: null },
  reps: { type: Number, default: null },
  sets: { type: Number, default: null },
  isDirectLog: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Entry', EntrySchema);
