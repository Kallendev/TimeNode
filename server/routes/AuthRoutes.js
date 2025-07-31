import express from 'express';
import { register, login, logout,getMe } from '../controller/AuthController.js';
import {requireAuth, requireAdmin} from '../middleware/AuthMiddleware.js';

const router = express.Router();

// POST /api/auth/register - Public route
router.post('/register', register);

//GET api/auth/me
router.get('/me',getMe)

// POST /api/auth/login - Public route
router.post('/login', login);

// POST /api/auth/logout - Protected route
router.post('/logout', requireAuth, requireAdmin, logout);

export default router;
