const mongoose = require('mongoose')
const invoiceSchema = new mongoose.Schema({
  jobOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'JobOrder', required: true },
  amount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  }
}, { timestamps: true })
module.exports = mongoose.model('Invoice', invoiceSchema)   