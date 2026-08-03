const mongoose = require('mongoose')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const connectDb = async() => {
    const uri = process.env.MONGODB_URI

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables')
    }

    mongoose.set('strictQuery', true)

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        })
        console.log('✅ MongoDB connected')
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message)
        throw error
    }
}

// 🚀 Perbaikan WAJIB: Ekspor fungsi koneksi secara langsung
module.exports = connectDb