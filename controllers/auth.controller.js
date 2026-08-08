const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Admin = require('../models/admin.model')

const signToken = (adminId) =>
    jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    })

const registerAdmin = async(req, res, next) => {
    try {
        const { email, password, setupCode } = req.body

        if (!process.env.ADMIN_SETUP_CODE) {
            return res.status(500).json({ message: 'ADMIN_SETUP_CODE is not configured' })
        }

        if (setupCode !== process.env.ADMIN_SETUP_CODE) {
            return res.status(403).json({ message: 'Invalid setup code' })
        }

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const existing = await Admin.findOne({ email })

        if (existing) {
            return res.status(409).json({ message: 'Admin already exists' })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const admin = await Admin.create({
            email,
            passwordHash,
        })

        res.status(201).json({
            message: 'Admin created',
            admin: {
                id: admin._id,
                email: admin.email,
            },
        })
    } catch (error) {
        next(error)
    }
}

const loginAdmin = async(req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const admin = await Admin.findOne({ email })

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not configured' })
        }

        const token = signToken(admin._id)

        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
            },
        })
    } catch (error) {
        next(error)
    }
}

const getProfile = async(req, res) => {
    res.json({
        admin: {
            id: req.admin._id,
            email: req.admin.email,
        },
    })
}

module.exports = {
    registerAdmin,
    loginAdmin,
    getProfile,
}