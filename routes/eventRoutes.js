const router = require('express').Router();

const {
  getEvents,
  createEvent,
} = require('../controllers/eventController');

const {
  protect,
  restrictTo,
} = require('../middlewares/auth');

router.get('/', getEvents);

router.post(
  '/',
  protect,
  restrictTo('organizer', 'admin'),
  createEvent
);

module.exports = router;