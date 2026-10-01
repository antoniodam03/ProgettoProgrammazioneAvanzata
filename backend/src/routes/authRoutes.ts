import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateLogin } from '../middleware/validate/authValidation';

const router = Router();

// ==========================================
// ROTTE AUTH
// ==========================================

// POST /auth/login
router.post('/login', validateLogin, AuthController.login);

export default router;
