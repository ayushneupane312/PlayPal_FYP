const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requested_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    bank_details: { type: mongoose.Schema.Types.Mixed, default: {} },
    processed_at: { type: Date, default: null },
  },
  { timestamps: true }
);

withdrawalSchema.index({ owner: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
