const express = require('express')
const router = express.Router()
const { protect, allowRoles } = require('../middleware/authMiddleware')
const { createJobOrder, getJobOrders, updateJobOrderStatus, cancelJobOrder } = require('../controllers/jobOrderController')

router.post('/', protect, allowRoles('sales', 'manager'), createJobOrder)
router.get('/', protect, getJobOrders)
router.patch('/:id/status', protect, allowRoles('manager', 'technician', 'sales'), updateJobOrderStatus)
router.patch('/:id/cancel', protect, allowRoles('sales', 'manager'), cancelJobOrder)

module.exports = router