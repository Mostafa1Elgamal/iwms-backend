const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    number: {type: Number, required: true},
    address: String,
    orderHistory:[{ type: mongoose.Schema.Types.ObjectId, ref: 'jobOrder'}]
},{timestamps: true})

module.exports = mongoose.model('Customer',customerSchema)