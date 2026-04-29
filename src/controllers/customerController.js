const Customer = require('../models/Customer')

const createCustomer = async(req, res) =>{
    const customer = Customer.create(req.body)
    res.status(201).json(customer)
}

const getCustomer = async(req,res) => {
    const customers = Customer.find().populate('orderHistory')
    res.json(customers)
}

const getCustomerByID = async(req, res) => {
    const customer = Customer.findById(req.params.id).populate('orderHistory')
    if(!customer){
        return res.status(401).json({message: 'Customer not Found'})
    }else{
        res.status(201).json(customer)
    }
}

const updateCustomer = async(req, res)=> {
    const customer = await Customer.findByIdAndUpdate(req.params.id,req.body, {new: true})
    if(!customer){
        return res.status(401).json({message: 'Customer not Found'})
    }
    res.json(customer)
}


module.exports = {createCustomer, getCustomer, getCustomerByID, updateCustomer }