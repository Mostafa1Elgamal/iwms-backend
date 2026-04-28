const JobOrder = require('../models/JobOrder')
const Material = require('../models/Material')
const Invoice = require('../models/Invoice')

const getDashboard = async (req, res) => {
  const totalOrders = await JobOrder.countDocuments()
  const inProgress = await JobOrder.countDocuments({
    status: { $in: ['pending', 'cutting', 'polishing', 'engraving', 'assembly'] }
  })
  const completed = await JobOrder.countDocuments({ status: 'completed' })
  const cancelled = await JobOrder.countDocuments({ status: 'cancelled' })

  const materials = await Material.find()
  const lowStockAlerts = materials.filter(m => m.quantity_in_stock <= m.min_threshold)

  const invoices = await Invoice.find({ paymentStatus: 'paid' })
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0)

  res.json({
    totalOrders,
    inProgress,
    completed,
    cancelled,
    lowStockAlerts: lowStockAlerts.map(m => ({ name: m.name, quantity: m.quantity_in_stock })),
    totalRevenue
  })
}

module.exports = { getDashboard }