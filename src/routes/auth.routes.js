const { Router } = require('express')
const { registerAdmin, loginAdmin, getProfile } = require('../controllers/auth.controller')
const authGuard = require('../middleware/auth')

const router = Router()

router.post('/register', registerAdmin)
router.post('/login', loginAdmin)
router.get('/me', authGuard, getProfile)

// 🚀 Tambahkan baris ini untuk mengekspor objek router
module.exports = router