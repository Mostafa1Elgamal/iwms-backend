const ProductionLog = require('../models/ProductionLog')
const JobOrder = require('../models/JobOrder')

const scanQR = async (req, res) => {
  const { jobOrderId, workstation, action } = req.body

  const order = await JobOrder.findById(jobOrderId)
  if (!order) return res.status(404).json({ message: 'Job order not found' })
  if (order.status === 'cancelled' || order.status === 'completed')
    return res.status(400).json({ message: 'Order already closed' })

  if (action === 'start') {
    const existingLog = await ProductionLog.findOne({
      jobOrder: jobOrderId,
      workstation,
      status: 'in-progress'
    })
    if (existingLog) return res.status(400).json({message: "the task already there"})
    const log = await ProductionLog.create({
      jobOrder: jobOrderId,
      workstation,
      technician: req.user._id,
      status: 'in-progress'
    })
    

    order.status = workstation
    await order.save()

    return res.status(201).json(log)
  }

  if (action === 'complete') {
    const log = await ProductionLog.findOne({
      jobOrderId: jobOrderId,
      workstation,
      status: 'in-progress'
    })
    if (!log) return res.status(404).json({ message: 'No active log found for this workstation' })
    
    log.endTime = Date.now()
    log.status = 'completed'
    const diffMins = log.endTime - log.startTime
    log.durationMinutes = Math.round(diffMins / 60000)
    await log.save()

    if (workstation === 'assembly'){
      order.status = 'completed'
    }
    await order.save()
    
    
    return res.json({ log, message: 'Workstation Completed'})
  }

  res.status(400).json({ message: 'Invalid action' })
}

const getProductionLogs = async (req, res) => {
  const logs = await ProductionLog.find({ jobOrder: req.params.jobOrderId })
    .populate('technician', 'name role')
  res.json(logs)
}

module.exports = { scanQR, getProductionLogs }