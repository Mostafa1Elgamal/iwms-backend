const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./src/config/db')


dotenv.config()
connectDB()

const app = express()
app.use(express.json())

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection:`, err.message)
    process.exit(1)
})

app.get('/',(req,res)=>{
    res.json({message: 'IWMS is running'})

})

app.use('/api/auth', require('./src/routes/authRoutes'))
app.use('/api/job-orders', require('./src/routes/jobOrders'))
app.use('/api/inventory', require('./src/routes/inventoryRoutes'))
app.use('/api/production', require('./src/routes/productionRoutes'))
app.use('/api/invoices', require('./src/routes/invoiceRoutes'))
app.use('/api/reports', require('./src/routes/reportRoutes'))
app.use('api/customer', require('./src/routes/customerRoutes'))
app.use('api/attendance', require('./src/routes/attendanceRoutes'))

const PORT = process.env.PORT || 5000

app.listen(PORT ,()=>{
    console.log("The Server Started and RBNA YSTR")
})