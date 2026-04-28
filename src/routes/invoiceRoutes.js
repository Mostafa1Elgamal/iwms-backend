const express = require("express")
const router = express.Router()
const {protect , allowRoles } = require('../middlewares/authMiddleware')
const { generateInvoice, updatePayment, getInvoices } = require("../controllers/invoiceController")

router.post('/', protect, allowRoles('accountant', 'manager'), generateInvoice)
router.patch('/:id/payment', protect, allowRoles('accountant', 'manager'), updatePayment)
router.get('/', protect, getInvoices)

module.exports = router