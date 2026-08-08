const { Schema, model } = require('mongoose')

const slideSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    subtitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    imagePublicId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})

// 🚀 Perbaikan WAJIB: Kompilasi dan ekspor Model
module.exports = model('Slide', slideSchema)