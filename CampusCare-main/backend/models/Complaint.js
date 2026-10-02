const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const complaintSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  photos: { type: [String], default: [] }
}, {
  timestamps: true,
});

// Create a virtual 'id' mapping to '_id' for seamless React integration
complaintSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
complaintSchema.set('toJSON', { virtuals: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
