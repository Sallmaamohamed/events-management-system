const Ticket = require('../models/Ticket');
const TicketInventoryLog = require('../models/TicketInventoryLog');

// 1. Create - إضافة فئة تذكرة جديدة لـ Event
exports.createTicket = async (req, res) => {
  try {
    const { eventId, type, price, capacity, salesStartDate, salesEndDate } = req.body;

    // المتاح في البداية = السعة الإجمالية
    const availableQuantity = capacity;

    const ticket = await Ticket.create({
      eventId,
      type,
      price,
      capacity,
      availableQuantity,
      salesStartDate,
      salesEndDate,
    });

    // تسجيل العملية في الـ Inventory Log
    await TicketInventoryLog.create({
      ticketId: ticket._id,
      actionType: 'initial_create',
      quantityChanged: capacity,
      previousQuantity: 0,
      newQuantity: capacity,
      reason: 'Initial creation of ticket tier',
    });

    res.status(201).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// 2. Read All - عرض كل التذاكر المتاحة لحدث معين (للعملاء والأدمن)
exports.getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const tickets = await Ticket.find({
      eventId,
      status: { $ne: 'deleted' }, // عدم عرض المحذوف
    });

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// 3. Read Single - جلب تفاصيل تذكرة واحدة بالـ ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket || ticket.status === 'deleted') {
      return res.status(404).json({ status: 'fail', message: 'Ticket not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// 4. Update - تعديل بيانات التذكرة (السعر، المواعيد)
exports.updateTicket = async (req, res) => {
  try {
    // نمنع تعديل الكميات المباشر هنا (لأن لها endpoint مخصص للـ Inventory)
    const { capacity, availableQuantity, ...updateData } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Ticket not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// 5. Inventory Adjustment - زيادة/تقليل المخزون يدوياً بواسطة الأدمن
exports.adjustInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { changeQuantity, reason } = req.body; // changeQuantity ممكن تكون موجبة (+20) أو سالبة (-10)

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Ticket not found' });
    }

    const previousQuantity = ticket.availableQuantity;
    const newQuantity = previousQuantity + changeQuantity;

    if (newQuantity < 0) {
      return res.status(400).json({ status: 'fail', message: 'Available quantity cannot be negative' });
    }

    ticket.availableQuantity = newQuantity;
    ticket.capacity += changeQuantity > 0 ? changeQuantity : 0; // تعديل الـ capacity إذا زاد العدد
    await ticket.save();

    // تسجيل التعديل في الـ Logs
    await TicketInventoryLog.create({
      ticketId: ticket._id,
      actionType: changeQuantity > 0 ? 'increase' : 'decrease',
      quantityChanged: Math.abs(changeQuantity),
      previousQuantity,
      newQuantity,
      reason: reason || 'Manual Admin adjustment',
    });

    res.status(200).json({
      status: 'success',
      data: { ticket },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// 6. Delete - حذف نرم (Soft Delete) للتذكرة
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted' },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Ticket not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// 7. Get Inventory Logs - عرض سجل التغييرات للتذكرة (الأدمن)
exports.getTicketLogs = async (req, res) => {
  try {
    const logs = await TicketInventoryLog.find({ ticketId: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: { logs },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};