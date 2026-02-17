const streamifier = require('streamifier')
const { cloudinary } = require('../config/cloudinary')

const uploadBufferToCloudinary = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
                folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            }
        )

        streamifier.createReadStream(buffer).pipe(uploadStream)
    })

const deleteFromCloudinary = async(publicId) => {
    if (!publicId) return null
    return cloudinary.uploader.destroy(publicId)
}

// Perbaikan: Tidak ada masalah sintaks di sini, namun jika "werror" merujuk 
// pada masalah linting atau penulisan yang tidak jelas, 
// ini adalah cara yang paling standar dan rapi untuk mengekspor.
module.exports = {
    uploadBufferToCloudinary,
    deleteFromCloudinary,
}
