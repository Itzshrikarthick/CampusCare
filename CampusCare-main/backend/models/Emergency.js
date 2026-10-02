const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const emergencySchema = new Schema({
  type: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'Reported' },
  time: { type: Date, default: Date.now },
  photos: { type: [String], default: [] },
  reportedBy: { type: String, default: 'user' }
}, {
  timestamps: true,
});

emergencySchema.virtual('id').get(function() {
  return this._id.toHexString();
});
emergencySchema.set('toJSON', { virtuals: true });

const Emergency = mongoose.model('Emergency', emergencySchema);
module.exports = Emergency;
