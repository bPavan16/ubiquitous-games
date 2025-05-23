import express from 'express';
import {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    logout
} from '../controllers/auth.controller.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

export default router;