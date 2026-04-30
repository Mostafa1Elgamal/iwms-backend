const mongoose = require('mongoose')
// models/Invoice.js — عدّل الـ schema
const invoiceSchema = new mongoose.Schema({
  jobOrder:{ type: mongoose.Schema.Types.ObjectId, ref: 'JobOrder', required: true },
  amount:{ type: Number, required: true },
  materialsCost:{ type: Number, default: 0 },
  laborCost:{ type: Number, default: 0 },
  amountPaid:{ type: Number, default: 0 },
  paymentStatus:{ type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  auditLog: [{
    action:String, 
    changedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldValue:mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp:{ type: Date, default: Date.now }
  }]
}, { timestamps: true })
module.exports = mongoose.model('Invoice', invoiceSchema)   