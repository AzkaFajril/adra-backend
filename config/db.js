const mongoose = require('mongoose')
const dns = require('dns')

dns.setServers(['8.8.8.8', '1.1.1.1'])

const cached = global.mongoose || { conn: null, promise: null }
global.mongoose = cached

const connectDb = async() => {
    const uri = process.env.MONGODB_URI

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables')
    }

    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        mongoose.set('strictQuery', true)

        cached.promise = mongoose
            .connect(uri, {
                serverSelectionTimeoutMS: 5000,
            })
            .then((connection) => {
                console.log('✅ MongoDB connected')
                return connection
            })
            .catch((error) => {
                cached.promise = null
                console.error('❌ MongoDB connection failed:', error.message)
                throw error
            })
    }

    cached.conn = await cached.promise
    return cached.conn
}

module.exports = connectDb