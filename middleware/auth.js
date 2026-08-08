const jwt = require('jsonwebtoken')
const Admin = require('../models/admin.model')

const authGuard = async(req, res, next) => {
    try {
        const header = req.headers.authorization

        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not configured' })
        }

        const token = header.split(' ')[1]
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        const admin = await Admin.findById(payload.id)

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' })
        }

        req.admin = admin
        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid token' })
        }

        next(error)
    }
}

module.exports = authGuard