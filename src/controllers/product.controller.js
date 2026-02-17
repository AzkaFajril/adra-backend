const Product = require('../models/product.model')
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary')

// 1. Perbaikan di formatLinks (3 tempat: menghilangkan spasi di sekitar ?.trim())
const formatLinks = (payload = {}) => ({
    shopee: payload.shopee?.trim() || '', 
    tiktok: payload.tiktok?.trim() || '', 
    whatsapp: payload.whatsapp?.trim() || '', 
})

const extractLinks = (body) => {
    if (!body) return formatLinks()

    if (body.links) {
        try {
            const parsed = typeof body.links === 'string' ? JSON.parse(body.links) : body.links
            return formatLinks(parsed)
        } catch (error) {
            throw new Error('links must be a valid JSON object')
        }
    }

    return formatLinks(body)
}

const uploadGalleryImages = async(files = []) => {
    const uploads = await Promise.all(
        files.map(async(file) => {
            const result = await uploadBufferToCloudinary(file.buffer, 'shop-gallery')
            return { url: result.secure_url, publicId: result.public_id }
        })
    )
    return uploads
}

const getProducts = async(_req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 })
        res.json(products)
    } catch (error) {
        next(error)
    }
}

const createProduct = async(req, res, next) => {
    try {
        const { name, description, longDescription, price, currency } = req.body

        if (!name || !description || !price) {
            return res.status(400).json({ message: 'name, description and price are required' })
        }

        // 2. Perbaikan di createProduct (menghilangkan spasi di sekitar ?.)
        if (!req.files?.mainImage?.[0]) { 
            return res.status(400).json({ message: 'Main image is required' })
        }

        const parsedPrice = Number(price)
        if (Number.isNaN(parsedPrice)) {
            return res.status(400).json({ message: 'price must be a number' })
        }

        let links
        try {
            links = extractLinks(req.body)
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }

        const mainUpload = await uploadBufferToCloudinary(req.files.mainImage[0].buffer, 'shop-main')
        const galleryUploads = req.files.gallery ? await uploadGalleryImages(req.files.gallery) : []

        const product = await Product.create({
            name,
            description,
            longDescription,
            price: parsedPrice,
            currency: currency || 'IDR',
            mainImageUrl: mainUpload.secure_url,
            mainImagePublicId: mainUpload.public_id,
            gallery: galleryUploads,
            links,
        })

        res.status(201).json(product)
    } catch (error) {
        next(error)
    }
}

const updateProduct = async(req, res, next) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const { name, description, longDescription, price, currency } = req.body

        if (name !== undefined) product.name = name
        if (description !== undefined) product.description = description
        if (longDescription !== undefined) product.longDescription = longDescription
        if (currency) product.currency = currency

        if (price !== undefined) {
            const parsedPrice = Number(price)
            if (Number.isNaN(parsedPrice)) {
                return res.status(400).json({ message: 'price must be a number' })
            }
            product.price = parsedPrice
        }

        try {
            product.links = extractLinks(req.body)
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }

        // 3. Perbaikan di updateProduct (tempat 1: menghilangkan spasi di sekitar ?.)
        if (req.files?.mainImage?.[0]) { 
            await deleteFromCloudinary(product.mainImagePublicId)
            const mainUpload = await uploadBufferToCloudinary(req.files.mainImage[0].buffer, 'shop-main')
            product.mainImageUrl = mainUpload.secure_url
            product.mainImagePublicId = mainUpload.public_id
        }

        // Handle deleted gallery indices
        let deletedIndices = []
        if (req.body.deletedGalleryIndices) {
            try {
                deletedIndices = typeof req.body.deletedGalleryIndices === 'string' ?
                    JSON.parse(req.body.deletedGalleryIndices) :
                    req.body.deletedGalleryIndices
            } catch (error) {
                return res.status(400).json({ message: 'deletedGalleryIndices must be a valid JSON array' })
            }
        }

        // Hapus gallery items berdasarkan indices
        if (deletedIndices.length > 0 && Array.isArray(deletedIndices)) {
            // Sort indices descending untuk menghindari masalah saat menghapus
            const sortedIndices = [...deletedIndices].sort((a, b) => b - a)
            for (const idx of sortedIndices) {
                if (product.gallery[idx]) {
                    await deleteFromCloudinary(product.gallery[idx].publicId)
                    product.gallery.splice(idx, 1)
                }
            }
        }

        // Jika ada gallery baru yang diupload, ganti semua gallery
        // 3. Perbaikan di updateProduct (tempat 2: menghilangkan spasi di sekitar ?.)
        if (req.files?.gallery?.length) {
            // Hapus gallery yang tersisa (jika ada)
            await Promise.all(product.gallery.map((image) => deleteFromCloudinary(image.publicId)))
            const galleryUploads = await uploadGalleryImages(req.files.gallery)
            product.gallery = galleryUploads
        }

        await product.save()

        res.json(product)
    } catch (error) {
        next(error)
    }
}

const deleteProduct = async(req, res, next) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        await deleteFromCloudinary(product.mainImagePublicId)
        await Promise.all(product.gallery.map((image) => deleteFromCloudinary(image.publicId)))

        await product.deleteOne()
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
}