const Ticket = require('../models/Ticket');
const TicketInventoryLog = require('../models/TicketInventoryLog');

// 1. Create - إنشاء فئة تذكرة جديدة لـ Event
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

    const initialQuantity =
      availableQuantity !== undefined ? availableQuantity : capacity;

    if (initialQuantity < 0 || initialQuantity > capacity) {
      return res.status(400).json({
        message: 'Available quantity must be between 0 and capacity',
      });
    }

    const ticket = await Ticket.create({
      eventId,
      type,
      price,
      capacity,
      availableQuantity: initialQuantity,
      salesStartDate,
      salesEndDate,
    });

    // تسجيل العملية في Inventory Log
    await TicketInventoryLog.create({
      ticketId: ticket._id,
      actionType: 'initial_create',
      quantityChanged: initialQuantity,
      previousQuantity: 0,
      newQuantity: initialQuantity,
      reason: 'Initial creation of ticket tier',
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Read All - عرض كل التذاكر الخاصة بـ Event معين
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

// 3. Read Single - عرض تذكرة واحدة
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

// 4. Update - تعديل بيانات التذكرة
exports.updateTicket = async (req, res, next) => {
  try {
    // لا نسمح بتعديل المخزون مباشرة من هنا
    const allowedFields = [
      'type',
      'price',
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

// 5. Inventory Adjustment - تعديل المخزون
exports.adjustInventory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // دعم quantity من main
    // و changeQuantity من integration
    const quantity =
      req.body.quantity !== undefined
        ? req.body.quantity
        : req.body.changeQuantity;

    const reason = req.body.reason;

    if (typeof quantity !== 'number' || quantity === 0) {
      return res.status(400).json({
        message: 'يجب إرسال quantity كرقم غير صفري',
      });
    }

    const ticket = await Ticket.findOne({
      _id: id,
      status: { $ne: 'deleted' },
    });

    if (!ticket) {
      return res.status(404).json({
        message: 'التذكرة غير موجودة',
      });
    }

    const previousQuantity = ticket.availableQuantity;
    const newQuantity = previousQuantity + quantity;

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

    // لو بنزود المخزون، نزود الـ capacity أيضًا
    if (quantity > 0) {
      ticket.capacity += quantity;
    }

    await ticket.save();

    // تسجيل التعديل في Inventory Logs
    await TicketInventoryLog.create({
      ticketId: ticket._id,
      actionType: quantity > 0 ? 'increase' : 'decrease',
      quantityChanged: Math.abs(quantity),
      previousQuantity,
      newQuantity,
      reason: reason || 'Manual Admin adjustment',
    });

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Delete - Soft Delete للتذكرة
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

// 7. Get Inventory Logs - عرض سجل تغييرات المخزون
exports.getTicketLogs = async (req, res, next) => {
  try {
    const logs = await TicketInventoryLog.find({
      ticketId: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};