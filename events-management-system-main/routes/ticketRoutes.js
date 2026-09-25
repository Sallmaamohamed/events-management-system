const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// 1. إنشاء تذكرة جديدة
router.post('/', ticketController.createTicket);

// 2. عرض كل التذاكر الخاصة بـ Event معين
router.get('/event/:eventId', ticketController.getTicketsByEvent);

// 3. عمليات على تذكرة واحدة محددة بالـ ID (عرض، تعديل بيانات، حذف)
router.route('/:id')
  .get(ticketController.getTicketById)
  .patch(ticketController.updateTicket)
  .delete(ticketController.deleteTicket);

// 4. تعديل المخزون يدوي من الأدمن (تزويد / تنقيص)
router.patch('/:id/inventory', ticketController.adjustInventory);

// 5. عرض سجل التغييرات في المخزون للتذكرة
router.get('/:id/logs', ticketController.getTicketLogs);

module.exports = router;