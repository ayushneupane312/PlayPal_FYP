const mongoose = require('mongoose');

/**
 * Immutable financial record per design doc §6 (transactions).
 * Created when a booking (or future: tournament) payment is verified as paid.
 */
const financialTransactionSchema = new mongoose.Schema(
  {
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      sparse: true,
      unique: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      sparse: true,
    },
    transaction_type: {
      type: String,
      enum: ['court_booking', 'tournament_registration', 'premium_feature'],
      default: 'court_booking',
    },
    gross_amount: { type: Number, required: true, min: 0 },
    commission_rate: { type: Number, required: true, min: 0, max: 1 },
    commission_amount: { type: Number, required: true, min: 0 },
    owner_earning: { type: Number, required: true, min: 0 },
    payment_method: {
      type: String,
      enum: ['khalti', 'stripe', 'cash', 'esewa', 'card', 'bank_transfer'],
      default: 'khalti',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
    },
    payout_status: {
      type: String,
      enum: ['pending', 'processing', 'settled'],
      default: 'pending',
    },
    reference_id: { type: String, default: '' },
    settled_at: { type: Date, default: null },
  },
  { timestamps: true }
);

financialTransactionSchema.index({ owner: 1, createdAt: -1 });
financialTransactionSchema.index({ venue: 1, createdAt: -1 });

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema);
