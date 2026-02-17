const { Schema, model } = require('mongoose')

const linkSchema = new Schema({
    shopee: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
}, { _id: false })

const gallerySchema = new Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
}, { _id: false })

const productSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 240 },
    longDescription: { type: String, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'IDR' },
    mainImageUrl: { type: String, required: true },
    mainImagePublicId: { type: String, required: true },
    gallery: { type: [gallerySchema], default: [] },
    links: { type: linkSchema, default: () => ({}) },
}, {
    timestamps: true,
})

// 🚀 Perbaikan WAJIB: Kompilasi dan ekspor Model
module.exports = model('Product', productSchema)