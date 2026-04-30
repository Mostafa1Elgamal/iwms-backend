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


const getDeadStock = async (req, res) => {
  const monthsThreshold = parseInt (req.query.months) || 6
  const cutoffDate = new Date ()
  cutoffDate.setMonth(cutoffDate.getMonth () - monthsThreshold)

  const deadMaterials = await Material.find ({
    UpdatedAt: { $lt: cutoffDate },
    Quantity_in_stock: { $gt: 0 }
  })

  res.json ({
    Threshold: `${monthsThreshold} months`,
    Count: deadMaterials.length,
    Materials: deadMaterials
  })
}

const getProductionReport = async (req, res) => {
  const logs = await ProductionLog.find({ status: 'completed', endTime: { $exists: true } })

  const byWorkstation = {}
  for (const log of logs) {
    const duration = (log.endTime - log.startTime) / 60000  
    if (!byWorkstation[log.workstation]) {
      byWorkstation[log.workstation] = { total: 0, count: 0 }
    }
    byWorkstation[log.workstation].total += duration
    byWorkstation[log.workstation].count += 1
  }

  const report = Object.entries(byWorkstation).map(([station, data]) => ({
    workstation: station,
    avgMinutes: (data.total / data.count).toFixed(1),
    totalJobs: data.count
  }))

  res.json(report)
}

module.exports = { getDashboard , getDeadStock , getProductionReport}