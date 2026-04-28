const express = require('express')
const router = express.Router()
const { protect, allowRoles } = require('../middlewares/authMiddleware')
const { addMaterial, getMaterials, updateMaterial, addCutOff, getCutOffs } = require('../controllers/inventoryController')

router.post('/materials', protect, allowRoles('inventory', 'manager'), addMaterial)
router.get('/materials', protect, getMaterials)
router.patch('/materials/:id', protect, allowRoles('inventory', 'manager'), updateMaterial)

router.post('/cutoffs', protect, allowRoles('technician', 'inventory'), addCutOff)
router.get('/cutoffs', protect, getCutOffs)

module.exports = router