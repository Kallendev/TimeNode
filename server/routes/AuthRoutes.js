import express from 'express';
import { register, login, logout,getMe, listUsers } from '../controller/AuthController.js';
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

// GET /api/auth - Admin list users
router.get('/', requireAuth, requireAdmin, listUsers);

export default router;
