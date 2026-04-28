const ProductionLog = require('../models/ProductionLog')
const JobOrder = require('../models/JobOrder')

const scanQR = async (req, res) => {
  const { jobOrderId, workstation, action } = req.body
  // action = 'start' or 'complete'

  const order = await JobOrder.findById(jobOrderId)
  if (!order) return res.status(404).json({ message: 'Job order not found' })
  if (order.status === 'cancelled' || order.status === 'completed')
    return res.status(400).json({ message: 'Order already closed' })

  if (action === 'start') {
    const log = await ProductionLog.create({
      jobOrder: jobOrderId,
      workstation,
      technician: req.user._id,
      status: 'in-progress'
    })
    // Update order status to current workstation
    order.status = workstation
    await order.save()
    return res.status(201).json(log)
  }

  if (action === 'complete') {
    const log = await ProductionLog.findOneAndUpdate(
      { jobOrder: jobOrderId, workstation, status: 'in-progress' },
      { endTime: Date.now(), status: 'completed' },
      { new: true }
    )
    if (!log) return res.status(404).json({ message: 'No active log found for this workstation' })
    return res.json(log)
  }

  res.status(400).json({ message: 'Invalid action' })
}

const getProductionLogs = async (req, res) => {
  const logs = await ProductionLog.find({ jobOrder: req.params.jobOrderId })
    .populate('technician', 'name role')
  res.json(logs)
}

module.exports = { scanQR, getProductionLogs }