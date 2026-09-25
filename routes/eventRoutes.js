const router = require('express').Router();
const { getEvents, createEvent } = require('../controllers/eventController');
const { protect, restricTo } = require('../middlewares/auth');

router.get('/', getEvents);
router.post('/', protect, restricTo('organizer', 'admin'), createEvent);

module.exports = router;
