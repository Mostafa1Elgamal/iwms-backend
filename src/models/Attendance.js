const mongoose = require ('mongoose')

const attendanceSchema = new mongoose.Schema ({
  Employee: { type: mongoose. Schema. Types. ObjectId, ref: 'User', required: true },
  CheckIn:  { type: Date, required: true },
  CheckOut: { type: Date },
  HoursWorked: { type: Number, default: 0 },
  Date: { type: String, required: true } 
}, { timestamps: true })

module.exports = mongoose.model ('Attendance', attendanceSchema)