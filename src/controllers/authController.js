const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bycrypt = require('bcryptjs')
const user = require('../models/user')


const generateToken = (id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' } )
}

const register = async (req,res)=>{
    const {name, email, password, role} = req.body
    const userExist = await User.findOne({email})
    if (userExist){
        return res.status(400).json({message: 'this user already exist'})
    }

    const salt = await bycrypt.genSalt(10)
    const hashedPassword = await bycrypt.hash(password, salt)

    const user = await User.create({name, email, password: hashedPassword, role})
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    })
}


const login = async (req,res) =>{
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.status(401).json({message: "invalid Credentials"})
    }
    const verifyPass = await bycrypt.compare(password, user.password)
    if(!verifyPass){
        return res.status(401).json({message: "invalid Credentials"})
    }
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    })
}


module.exports = { register, login }