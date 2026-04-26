const moongose = require('mongoose')

const materialSchema = new moongose.Schema({
    name: {type: String, required: true},
    type: String,
    supplier_name: String,
    quantity_in_stock: {type: Number, required: true},
    min_threshold: {type: Number, default: 10},
    cost_per_unit: Number
}, {timestamps: true})

module.exports = moongose.model('Material',materialSchema)