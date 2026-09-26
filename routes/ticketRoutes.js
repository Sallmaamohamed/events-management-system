const express = require('express');

const router = express.Router();

const ticketController = require('../controllers/ticketController');

// إنشاء تذكرة جديدة
router.post('/', ticketController.createTicket);

// عرض تذاكر Event معين
router.get('/event/:eventId', ticketController.getTicketsByEvent);

// عمليات على تذكرة واحدة
router
  .route('/:id')
  .get(ticketController.getTicketById)
  .patch(ticketController.updateTicket)
  .delete(ticketController.deleteTicket);

// تعديل المخزون
router.patch('/:id/inventory', ticketController.adjustInventory);

// عرض سجل تغييرات المخزون
router.get('/:id/logs', ticketController.getTicketLogs);

module.exports = router;
