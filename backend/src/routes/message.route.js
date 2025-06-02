import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware.js';
const router = express.Router();
import { getUsersForSidebar } from '../controllers/message.controller.js';
import { getMessages } from '../controllers/message.controller.js';
import { sendMessages } from '../controllers/message.controller.js';

router.get('/users', protectRoute, getUsersForSidebar);
router.get('/:id', protectRoute, getMessages);

router.post('/send/:id', protectRoute, sendMessages);

export default router;