import { Router } from 'express';
import { authMiddleware, authorize, Ruolo } from '../middleware/authMiddleware';
import * as assegnazioneController from '../controllers/assegnazioneController';
import {
    validateGetAssegnazioneById,
} from '../middleware/validate/assegnazioneValidation';

const router = Router();

// ==========================================
// ROTTE ASSEGNAZIONI
// ==========================================

// GET /assegnazioni - Tutte le assegnazioni (operatore)
router.get('/', authMiddleware, authorize(Ruolo.operatore), assegnazioneController.getAllAssegnazioni);

// GET /assegnazioni/:id - Singola assegnazione (operatore)
router.get('/:id', authMiddleware, authorize(Ruolo.operatore), validateGetAssegnazioneById, assegnazioneController.getAssegnazioneById);

export default router;
