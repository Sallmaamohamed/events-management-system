const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Ticket must belong to an Event'],
    },

    type: {
      type: String,
      required: [true, 'Ticket type is required (e.g., VIP, Regular)'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Price cannot be negative'],
    },

    capacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
    },

    salesStartDate: Date,
    salesEndDate: Date,

    status: {
      type: String,
      enum: ['active', 'sold_out', 'disabled', 'deleted'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre('save', function (next) {
  if (this.availableQuantity === 0 && this.status !== 'deleted') {
    this.status = 'sold_out';
  } else if (
    this.availableQuantity > 0 &&
    this.status === 'sold_out'
  ) {
    this.status = 'active';
  }

  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);