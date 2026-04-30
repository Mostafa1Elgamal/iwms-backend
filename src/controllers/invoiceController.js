const Invoice = require('../models/Invoice')
const JobOrder = require('../models/JobOrder')

const generateInvoice = async (req, res) => {
  const { jobOrderId } = req.body

  const order = await JobOrder.findById(jobOrderId).populate('materialsUsed.material')
  if (!order) return res.status(404).json({ message: 'Job order not found' })

  const existingInvoice = await Invoice.findOne({ jobOrder: jobOrderId })
  if (existingInvoice) return res.status(400).json({ message: 'Invoice already exists' })

  // حساب تكلفة المواد
  let materialsCost = 0
  for (let item of order.materialsUsed) {
    if (item.material?.cost_per_unit) {
      materialsCost += item.material.cost_per_unit * item.quantity
    }
  }


  const logs = await ProductionLog.find({ jobOrder: jobOrderId, status: 'completed' })
    .populate('technician', 'hourlyRate')
  let laborCost = 0
  for (const log of logs) {
    if (log.endTime && log.technician?.hourlyRate) {
      const hours = (log.endTime - log.startTime) / 3600000
      laborCost += hours * log.technician.hourlyRate
    }
  }

  const total = materialsCost + laborCost

  order.totalCost = total
  await order.save()

  const invoice = await Invoice.create({
    jobOrder: jobOrderId,
    amount: total,
    materialsCost,
    laborCost,
    paymentStatus: 'unpaid'
  })

  res.status(201).json(invoice)
}

const updatePayment = async (req, res) => {
  const { amountPaid } = req.body
  const invoice = await Invoice.findById(req.params.id)
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

  invoice.amountPaid = amountPaid

  if (amountPaid >= invoice.amount) {
    invoice.paymentStatus = 'paid'
  } else if (amountPaid > 0) {
    invoice.paymentStatus = 'partial'
  } else {
    invoice.paymentStatus = 'unpaid'
  }

  await invoice.save()
  // في updatePayment — زود الـ audit log:
  invoice.auditLog.push({
    action: 'payment_updated',
    changedBy: req.user._id,
    oldValue: { amountPaid: invoice.amountPaid, status: invoice.paymentStatus },
    newValue:  { amountPaid, status: newStatus },
    timestamp: new Date()
  })
  res.json(invoice)
}

const getInvoices = async (req, res) => {
  const invoices = await Invoice.find()
    .populate({ path: 'jobOrder', populate: { path: 'customer' } })
  res.json(invoices)
}

module.exports = { generateInvoice, updatePayment, getInvoices }