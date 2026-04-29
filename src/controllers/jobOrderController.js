const JobOrder = require('../models/JobOrder')
const Material = require('../models/Material')
const CutOff = require('../models/CutOff')
const QRCode = require('qrcode')

const createJobOrder = async (req, res) => {
  const { customer, dimensions, materialsUsed, deliveryDate, notes } = req.body

  // 1. Check inventory
  for (let item of materialsUsed) {
    const material = await Material.findById(item.material)
    if (!material) return res.status(404).json({ message: `Material not found` })

    // Check cutoffs first
    const cutoff = await CutOff.findOne({ material: item.material, status: 'available' })
    if (cutoff) {
      cutoff.status = 'used'
      await cutoff.save()
    } else {
      // Check main stock
      if (material.quantity_in_stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${material.name}` })
      material.quantity_in_stock -= item.quantity
      await material.save()
    }
  }

  // 2. Create order
  const order = await JobOrder.create({
    customer, dimensions, materialsUsed,
    deliveryDate, notes,
    createdBy: req.user._id
  })

  // 3. Generate QR
  const qrCode = await QRCode.toDataURL(order._id.toString())
  order.qrCode = qrCode
  await order.save()

  res.status(201).json(order)
}

const getJobOrders = async (req, res) => {
  const { status } = req.query
  const filter = status ? { status } : {}
  const orders = await JobOrder.find(filter).populate('customer').populate('materialsUsed.material')
  res.json(orders)
}

const updateJobOrderStatus = async (req, res) => {
  const order = await JobOrder.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  )
  res.json(order)
}

const cancelJobOrder = async (req, res) => {
  const order = await JobOrder.findById(req.params.id)
  if (order.status === 'cancelled')
    return res.status(400).json({ message: 'Already cancelled' })

  // Return materials to stock
  for (let item of order.materialsUsed) {
    const cutOff = await CutOff.findById({ material: item.material, status: 'used'})
    if(cutOff){
      cutOff.status = 'available'
      await cutOff.save()
    } else{
      const material = await Material.findById(item.material)
      if(material){
        material.quantity_in_stock += item.quantity
        await material.save()
    }
  }}

  order.status = 'cancelled'
  await order.save()
  res.json({ message: 'Order cancelled and materials returned' })
}

module.exports = { createJobOrder, getJobOrders, updateJobOrderStatus, cancelJobOrder }