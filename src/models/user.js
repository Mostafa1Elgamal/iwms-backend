const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true, unique: true},
    role:{ type: String, enum:["manager","accountant","sales","technician","inventory"],
        required: true
    }
},{timestamps: true})

module.exports = mongoose.model('User',userSchema)