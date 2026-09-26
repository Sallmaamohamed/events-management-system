const User = require('../models/User');
const Event = require('../models/Events');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Users
    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({
      status: 'Active',
    });

    const suspendedUsers = await User.countDocuments({
      status: 'Suspended',
    });

    // Events
    const totalEvents = await Event.countDocuments();

    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });

    const pastEvents = await Event.countDocuments({
      date: { $lt: new Date() },
    });

    // Tickets
    const ticketStats = await Ticket.aggregate([
      {
        $match: {
          status: { $ne: 'deleted' },
        },
      },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          availableTickets: { $sum: '$availableQuantity' },
        },
      },
    ]);

    const totalCapacity = ticketStats[0]?.totalCapacity || 0;
    const availableTickets = ticketStats[0]?.availableTickets || 0;
    const soldTickets = totalCapacity - availableTickets;

    // Bookings
    const totalBookings = await Booking.countDocuments();

    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalBookedTickets: { $sum: '$quantity' },
        },
      },
    ]);

    const totalRevenue = bookingStats[0]?.totalRevenue || 0;
    const totalBookedTickets =
      bookingStats[0]?.totalBookedTickets || 0;

    res.status(200).json({
      success: true,

      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },

        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          past: pastEvents,
        },

        tickets: {
          totalCapacity,
          sold: soldTickets,
          available: availableTickets,
        },

        bookings: {
          total: totalBookings,
          totalBookedTickets,
          totalRevenue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};