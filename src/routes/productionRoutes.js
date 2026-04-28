const express = require('express')
const router = express.Router()
const { protect, allowRoles } = require('../middlewares/authMiddleware')
const { scanQR, getProductionLogs } = require('../controllers/productionController')

router.post('/scan', protect, allowRoles('technician', 'manager'), scanQR)
router.get('/:jobOrderId', protect, getProductionLogs)

module.exports = router