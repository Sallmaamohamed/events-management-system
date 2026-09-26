const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const revenue = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingsAnalytics = async (req, res, next) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          bookings: { $sum: 1 },
          tickets: { $sum: '$quantity' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
exports.getEventsAnalytics = async (req, res, next) => {
  try {
    const events = await Booking.aggregate([
      {
        $lookup: {
          from: 'tickets',
          localField: 'ticket',
          foreignField: '_id',
          as: 'ticketData',
        },
      },
      {
        $unwind: '$ticketData',
      },
      {
        $lookup: {
          from: 'events',
          localField: 'ticketData.eventId',
          foreignField: '_id',
          as: 'eventData',
        },
      },
      {
        $unwind: '$eventData',
      },
      {
        $group: {
          _id: '$eventData._id',
          title: { $first: '$eventData.title' },
          ticketsSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: {
          ticketsSold: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
exports.getTicketsAnalytics = async (req, res, next) => {
  try {
    const tickets = await Ticket.aggregate([
      {
        $match: {
          status: { $ne: 'deleted' },
        },
      },
      {
        $project: {
          type: 1,
          price: 1,
          capacity: 1,
          availableQuantity: 1,
          sold: {
            $subtract: ['$capacity', '$availableQuantity'],
          },
          status: 1,
        },
      },
      {
        $sort: {
          sold: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};
exports.getUsersAnalytics = async (req, res, next) => {
  try {
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const usersByStatus = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byRole: usersByRole,
        byStatus: usersByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};