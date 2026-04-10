const mongoose = require('mongoose');

/**
 * Global default: owner = null. Per-owner overrides when owner is set.
 */
const commissionConfigSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    effective_from: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

commissionConfigSchema.index({ owner: 1, effective_from: -1 });

module.exports = mongoose.model('CommissionConfig', commissionConfigSchema);
