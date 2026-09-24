const mongoose = require('mongoose');

const ticketInventoryLogSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['increase', 'decrease', 'hold', 'release', 'initial_create'],
      required: true,
    },
    quantityChanged: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String, default: 'Manual adjustment or Booking action' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketInventoryLog', ticketInventoryLogSchema);