const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

exports.createBooking = async (req, res, next) => {
  try {
    const { ticketId, quantity } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'التذكرة غير موجودة' });
    }

    if (ticket.availableQuantity < quantity) {
      return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة' });
    }

    ticket.availableQuantity -= quantity;
    await ticket.save();

    const booking = await Booking.create({
      user: req.user._id,
      ticket: ticketId,
      quantity,
      totalPrice: ticket.price * quantity
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};