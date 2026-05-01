const Material = require('../models/Material')
const CutOff = require('../models/CutOff')

const addMaterial = async (req, res) => {
  const material = await Material.create(req.body)
  res.status(201).json(material)
}

const getMaterials = async (req, res) => {
  const materials = await Material.find()
  const withAlerts = materials.map(m => ({
    ...m._doc,
    lowStock: m.quantity_in_stock <= m.min_threshold
  }))
  res.json(withAlerts)
}

const updateMaterial = async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(material)
}

const addCutOff = async (req, res) => {
  const cutoffsData = req.body
  if(Array.isArray(cutoffsData)){
    const createdCutoffs = await CutOff.insertMany(cutoffsData)

    res.status(201).json(createdCutoffs)
  } else{
    const cutoff = await CutOff.create(cutoffsData)
    res.status(201).json(cutoff)
  }
}

const getCutOffs = async (req, res) => {
  const cutoffs = await CutOff.find({ status: 'available' }).populate('material')
  res.json(cutoffs)
}


const getDeadStock = async (req,res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)  

  const deadStock = await Material.find({
    updatedAt: {$lte : sixMonthsAgo},
    quantity_in_stock: { $gt: 0 }
  })

  res.json(deadStock)
}

module.exports = { addMaterial, getMaterials, updateMaterial, addCutOff, getCutOffs, getDeadStock }