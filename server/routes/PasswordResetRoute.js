// routes/PasswordResetRoutes.js
import express from 'express';
import { requestReset, resetPassword } from '../controller/PasswordResetController.js';
const router = express.Router();

//route for  requesting a password reset
//POST /api/password-reset
router.post('/request-reset', requestReset);

//route for resetting password
//POST /api/password-reset
router.post('/reset-password', resetPassword);



export default router;
