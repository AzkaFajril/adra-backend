const Slide = require('../models/slide.model')
    // 1. PERBAIKAN IMPOR: Hapus 'cloudinary' karena sudah ada di utils/cloudinary
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary')

const getSlides = async(_req, res, next) => {
    try {
        // Jika koneksi database OK, ini seharusnya berhasil.
        const slides = await Slide.find().sort({ createdAt: -1 })
        res.json(slides)
    } catch (error) {
        // Ini akan menangani error database (seperti skema salah atau koneksi tiba-tiba mati)
        console.error("Error fetching slides:", error);
        next(error)
    }
}

const createSlide = async(req, res, next) => {
    try {
        const { title, subtitle } = req.body

        if (!title || !subtitle) {
            return res.status(400).json({ message: 'title and subtitle are required' })
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' })
        }

        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'slides')

        const slide = await Slide.create({
            title,
            subtitle,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
        })

        res.status(201).json(slide)
    } catch (error) {
        next(error)
    }
}

const updateSlide = async(req, res, next) => {
    try {
        const { id } = req.params
        const { title, subtitle } = req.body

        const slide = await Slide.findById(id)

        if (!slide) {
            return res.status(404).json({ message: 'Slide not found' })
        }

        if (title) {
            slide.title = title
        }

        if (subtitle) {
            slide.subtitle = subtitle
        }

        if (req.file) {
            if (slide.imagePublicId) {
                // 2. PERBAIKAN: Gunakan utilitas deleteFromCloudinary
                await deleteFromCloudinary(slide.imagePublicId)
            }

            const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'slides')
            slide.imageUrl = uploadResult.secure_url
            slide.imagePublicId = uploadResult.public_id
        }

        await slide.save()

        res.json(slide)
    } catch (error) {
        next(error)
    }
}

const deleteSlide = async(req, res, next) => {
    try {
        const { id } = req.params

        const slide = await Slide.findById(id)

        if (!slide) {
            return res.status(404).json({ message: 'Slide not found' })
        }

        if (slide.imagePublicId) {
            // 3. PERBAIKAN: Gunakan utilitas deleteFromCloudinary
            await deleteFromCloudinary(slide.imagePublicId)
        }

        await slide.deleteOne()

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getSlides,
    createSlide,
    updateSlide,
    deleteSlide,
}