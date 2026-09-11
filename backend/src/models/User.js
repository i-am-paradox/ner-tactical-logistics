const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'district_officer', 'field_agent', 'driver'], 
    default: 'field_agent' 
  },
  districtId: { type: String, default: 'AS-KAM' },
  districtName: { type: String, default: 'Kamrup Metropolitan' },
  phone: { type: String, default: '+91 90000 00000' },
  preferredLanguage: { type: String, default: 'en', enum: ['en', 'as', 'bn', 'hi', 'mni'] },
  badgeNumber: { type: String, default: 'NER-AGT-001' },
  department: { type: String, default: 'NER Disaster & Logistics Operations' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
