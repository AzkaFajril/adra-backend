const { Router } = require('express')
const { getSlides, createSlide, updateSlide, deleteSlide } = require('../controllers/slide.controller')
const upload = require('../middleware/upload')
const authGuard = require('../middleware/auth')

const router = Router()

router.get('/', getSlides)
router.post('/', authGuard, upload.single('image'), createSlide)
router.put('/:id', authGuard, upload.single('image'), updateSlide)
router.delete('/:id', authGuard, deleteSlide)

module.exports = router