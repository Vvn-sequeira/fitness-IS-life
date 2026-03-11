const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const fastingPlanSchema = new mongoose.Schema({
  type: { type: String, enum: ['16:8', '14:10', '18:6', '20:4', 'Custom', 'None'], default: 'None' },
  startTime: { type: String }, // 'HH:mm' Format
  endTime: { type: String },   // 'HH:mm' Format
  isActive: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentWeight: { type: Number, default: null }, // Weight logging, appended to user model
  fastingPlan: { type: fastingPlanSchema, default: {} }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12); // Salt factor 12 requested
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
