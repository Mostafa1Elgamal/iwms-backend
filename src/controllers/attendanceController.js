const Attendance = require ('../models/Attendance')

const checkIn = async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const existing = await Attendance.findOne({employee: req.user._id, date:today })
  if(existing){
    return res.status(400).json({ message: 'Already checked in today' })
}
  const record = await Attendance.create({
    Employee: req.user._id,
    CheckIn: new Date(),
    Date: today
  })
  res.status(201).json(record)
}

const checkOut = async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const record = await Attendance.findOne({ employee: req.user._id, date: today })
  if (!record) return res.status(404).json({ message: 'No check-in found for today' })
  if (record.checkOut) return res.status(400).json({ message: 'Already checked out' })

  record.checkOut = new Date ()
  record.hoursWorked = ((record.checkOut - record.checkIn)/3600000).toFixed(2)
  await record.save()
  res.json(record)
}

const getAttendanceReport = async (req, res) => {
  const { startDate, endDate } = req.query
  const filter = {}
  if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate }

  const records = await Attendance.find(filter)
    .populate ('employee', 'name role')
    .sort ({ date: -1 })
  res.json (records)
}


module.exports = { checkIn, checkOut, getAttendanceReport }