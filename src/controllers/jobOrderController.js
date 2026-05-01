const JobOrder = require('../models/JobOrder')
const Material = require('../models/Material')
const CutOff = require('../models/CutOff')
const QRCode = require('qrcode')

const createJobOrder = async (req, res) => {
  const { customer, dimensions, materialsUsed, deliveryDate, notes } = req.body

  // 1. Check inventory
  let processedMaterials = [];
  for (let item of materialsUsed) {
    const material = await Material.findById(item.material)
    if (!material) return res.status(404).json({ message: `Material not found` })

    let cutOffsToUse =[];
    let mainStockNeeded = 0;
    const availableCutoff = await CutOff.findOne({
      material: item.material,
      status: 'available',
      'dimensions.height':{ $gte: dimensions.height },
      'dimensions.width': { $gte: dimensions.width },
      'dimensions.thickness': { $gte: dimensions.thickness }
        
    }).limit(item.quantity)

    cutOffsToUse = availableCutoff.map(c => c._id)
    mainStockNeeded = item.quantity - cutOffsToUse.length

    if (mainStockNeeded > 0 && material.quantity_in_stock < mainStockNeeded){
      return res.status(400).json({ message: `Insufficient stock for ${material.name}` })
    }
    processedMaterials.push({
      materialId: item.material,
      materialDoc: material,
      cutOffsToUse,
      mainStockNeeded
    })
    
  }

  let finalMaterialsUsed = [];

  for (let processed of processedMaterials){
    if (processsed.cutOffsToUse.length > 0){
      await CuttOff.updateMany(
        { _id: {$in: processed.cutOffsToUse } },
        { $set: { status: 'used' } }
      )
    }
      if(processed.mainStockNeeded > 0){
      processed.materialDoc.quantity_in_stock -= processed.mainStockNeeded
      await processed.materialDoc.save()
      
      if(processed.materialDoc.quantity_in_stock <= processed.materialDoc.min.threshold) {
        console.log(`{Alert ybny}: Material ${processed.materialDoc.name} is tunning low`)
      }
    }


    finalMaterialsUsed.push({
      material: processed.materialId,
      quantity: processed.cutOffsToUse.length + processed.mainStockNeeded,
      cutOffsUsed: processed.cutOffsToUse,
      mainStockDeducted: processed.mainStockNeeded
    })

  }

  
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