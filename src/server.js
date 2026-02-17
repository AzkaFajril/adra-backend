require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDb = require('./config/db')
const { configureCloudinary } = require('./config/cloudinary')
const slideRoutes = require('./routes/slide.routes')
const authRoutes = require('./routes/auth.routes')
const productRoutes = require('./routes/product.routes')

const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()) : ['http://localhost:5173']

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
)

app.use(express.json({ limit: '30mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/slides', slideRoutes)
app.use('/api/products', productRoutes)

app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err)
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    })
})

const PORT = process.env.PORT || 5000

const startServer = async() => {
    try {
        await connectDb()
        configureCloudinary()

        app.listen(PORT, () => {
            console.log(`🚀 Server ready at http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()

module.exports = app