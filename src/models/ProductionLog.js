const mongoose = require('mongoose')

const productionLogSchema = new mongoose.Schema({
  jobOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'JobOrder', required: true },
  workstation: {
    type: String,
    enum: ['cutting', 'polishing', 'engraving', 'assembly'],
    required: true
  },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' }
}, { timestamps: true })

module.exports = mongoose.model('ProductionLog', productionLogSchema)