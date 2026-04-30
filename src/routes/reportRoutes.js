const express = require('express')
const router = express.Router()
const { protect, allowRoles } = require('../middlewares/authMiddleware')
const { getDashboard, getDeadStock, getProductionReport } = require('../controllers/reportController')

router.get('/dashboard', protect, allowRoles('manager'), getDashboard)
router.get('/dead-stock', protect, allowRoles ('manager', 'inventory'), getDeadStock)
router.get('/production', protect, allowRoles('manager'), getProductionReport)


module.exports = router