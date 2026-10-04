import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateLogin } from '../middleware/validate/authValidation';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ==========================================
// ROTTE AUTH
// ==========================================

// POST /auth/login
router.post('/login', validateLogin, AuthController.login);

//POST /auth/logout
router.post('/logout', authMiddleware, AuthController.logout);
export default router;
