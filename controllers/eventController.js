const Event = require('../models/Events');

exports.getEvents = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'Published' };

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query).populate('organizer', 'name email');
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user._id
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};