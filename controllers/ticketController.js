const Ticket = require('../models/Ticket');


// إنشاء تذكرة جديدة
exports.createTicket = async (req, res, next) => {
  try {
    const {
      eventId,
      type,
      price,
      capacity,
      availableQuantity,
      salesStartDate,
      salesEndDate,
    } = req.body;

    const ticket = await Ticket.create({
      eventId,
      type,
      price,
      capacity,
      availableQuantity:
        availableQuantity !== undefined
          ? availableQuantity
          : capacity,
      salesStartDate,
      salesEndDate,
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// عرض كل التذاكر الخاصة بـ Event معين
exports.getTicketsByEvent = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      eventId: req.params.eventId,
      status: { $ne: 'deleted' },
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};


// عرض تذكرة واحدة
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      status: { $ne: 'deleted' },
    });

    if (!ticket) {
      return res.status(404).json({
        message: 'التذكرة غير موجودة',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// تعديل بيانات التذكرة
exports.updateTicket = async (req, res, next) => {
  try {
    const allowedFields = [
      'type',
      'price',
      'capacity',
      'salesStartDate',
      'salesEndDate',
      'status',
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $ne: 'deleted' },
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ticket) {
      return res.status(404).json({
        message: 'التذكرة غير موجودة',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// حذف التذكرة
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted' },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        message: 'التذكرة غير موجودة',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف التذكرة',
    });
  } catch (error) {
    next(error);
  }
};


// تعديل المخزون
exports.adjustInventory = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity === 0) {
      return res.status(400).json({
        message: 'يجب إرسال quantity كرقم غير صفري',
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      status: { $ne: 'deleted' },
    });

    if (!ticket) {
      return res.status(404).json({
        message: 'التذكرة غير موجودة',
      });
    }

    const newQuantity = ticket.availableQuantity + quantity;

    if (newQuantity < 0) {
      return res.status(400).json({
        message: 'لا يمكن أن تصبح الكمية المتاحة أقل من صفر',
      });
    }

    if (newQuantity > ticket.capacity) {
      return res.status(400).json({
        message: 'الكمية المتاحة لا يمكن أن تتجاوز السعة',
      });
    }

    ticket.availableQuantity = newQuantity;

    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// سجل تغييرات المخزون
exports.getTicketLogs = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Inventory logs are not implemented yet',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};