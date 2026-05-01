const mongoose = require('mongoose')
const jobOrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dimensions: { height: Number, width: Number },
  materialsUsed: [{
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    quantity: {Number, required: true},
    cutOffUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CutOff'}],
    mainStockDeducted: { type: Number, default: 0}
  }],
  status: {
    type: String,
    enum: ['pending', 'cutting', 'polishing', 'engraving', 'assembly', 'completed', 'cancelled'],
    default: 'pending'
  },
  qrCode: String,
  totalCost: { type: Number, default: 0 },
  deliveryDate: Date,
  notes: String
}, { timestamps: true })
module.exports = mongoose.model('JobOrder', jobOrderSchema)