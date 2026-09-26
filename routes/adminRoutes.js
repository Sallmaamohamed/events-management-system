const express = require('express');

const router = express.Router();

const {
  getDashboardStats,
} = require('../controllers/adminController');

const {
  getRevenueAnalytics,
  getBookingsAnalytics,
  getEventsAnalytics,
  getTicketsAnalytics,
  getUsersAnalytics,
} = require('../controllers/analyticsController');
const {
  protect,
  restrictTo,
} = require('../middlewares/auth');

router.get(
  '/stats',
  protect,
  restrictTo('admin'),
  getDashboardStats
);

router.get(
  '/analytics/revenue',
  protect,
  restrictTo('admin'),
  getRevenueAnalytics
);

router.get(
  '/analytics/bookings',
  protect,
  restrictTo('admin'),
  getBookingsAnalytics
);

router.get(
  '/analytics/events',
  protect,
  restrictTo('admin'),
  getEventsAnalytics
);

router.get(
  '/analytics/tickets',
  protect,
  restrictTo('admin'),
  getTicketsAnalytics
);

router.get(
  '/analytics/users',
  protect,
  restrictTo('admin'),
  getUsersAnalytics
);
module.exports = router;