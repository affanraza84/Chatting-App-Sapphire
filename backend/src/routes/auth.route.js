import express from 'express'
const router = express.Router();
import { signup, login, logout } from '../controllers/auth.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'
import { updateProfile } from '../controllers/auth.controller.js'
import multer from 'multer'
import { checkAuth } from '../controllers/auth.controller.js'

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use((req, res, next) => {
    console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
    next();
});

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

router.put('/update-profile', protectRoute, upload.single('profilePic'), (req, res, next) => {
    console.log('Multer middleware processed request');
    console.log('File received:', req.file ? 'Yes' : 'No');
    next();
}, updateProfile)

router.get('/check', protectRoute, checkAuth)

export default router;
