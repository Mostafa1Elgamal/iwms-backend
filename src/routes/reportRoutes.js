const express = require('express')
const router = express.Router()
const { protect, allowRoles } = require('../middlewares/authMiddleware')
const { getDashboard } = require('../controllers/reportController')

router.get('/dashboard', protect, allowRoles('manager'), getDashboard)


module.exports = router