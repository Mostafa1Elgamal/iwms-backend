const express = require('express')
const router = express.Router()
const {protect, allowRoles} = require('../middlewares/authMiddleware')
const {createCustomer, getCustomer, getCustomerByID, updateCustomer } = require('../controllers/customerController')

router.post('/', protect, allowRoles('sales','manager'), createCustomer)
router.get('/', protect, getCustomer)
router.get('/:id', protect, getCustomerByID)
router.patch('/:id', protect, allowRoles('sales','manager'), updateCustomer)


module.exports = router