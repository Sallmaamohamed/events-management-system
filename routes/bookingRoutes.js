const router = require('express').Router();
const { createBooking } = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, createBooking);

module.exports = router;
