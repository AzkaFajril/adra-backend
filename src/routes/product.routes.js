const { Router } = require('express')
const authGuard = require('../middleware/auth')
const upload = require('../middleware/upload')
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller')

const router = Router()

router.get('/', getProducts)
router.post(
    '/',
    authGuard,
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'gallery', maxCount: 6 },
    ]),
    createProduct
)
router.put(
    '/:id',
    authGuard,
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'gallery', maxCount: 6 },
    ]),
    updateProduct
)
router.delete('/:id', authGuard, deleteProduct)

// 🚀 PERBAIKAN WAJIB: Mengekspor objek router agar bisa digunakan oleh app.use()
module.exports = router