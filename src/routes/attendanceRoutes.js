// routes/attendanceRoutes. Js — ملف جديد
const express = require('express')
const router = express.Router()
const { protect, allowRoles } = require ('../middlewares/authMiddleware')
const { checkIn, checkOut, getAttendanceReport } = require ('../controllers/attendanceController')

router.post('/checkin',protect, checkIn)
router.post('/checkout',protect, checkOut)
router.get('/report',protect, allowRoles('manager'), getAttendanceReport)

module.exports = router