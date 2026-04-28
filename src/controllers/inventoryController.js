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
  const cutoff = await CutOff.create(req.body)
  res.status(201).json(cutoff)
}

const getCutOffs = async (req, res) => {
  const cutoffs = await CutOff.find({ status: 'available' }).populate('material')
  res.json(cutoffs)
}

module.exports = { addMaterial, getMaterials, updateMaterial, addCutOff, getCutOffs }