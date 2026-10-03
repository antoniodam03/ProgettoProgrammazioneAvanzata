import { Router } from 'express';
import { authMiddleware, authorize, Ruolo } from '../middleware/authMiddleware';

import * as pazienteController from '../controllers/pazienteController';
import {
    validateGetPazienteById,
    validateCreatePaziente,
    validateUpdatePaziente,
    validateDimettiPaziente
} from '../middleware/validate/pazienteValidation';

const router = Router();

// ==========================================
// ROTTE CRUD PAZIENTI
// ==========================================

// GET /pazienti/ricoverati 
router.get('/ricoverati', authMiddleware, authorize(Ruolo.operatore), pazienteController.getAllPazientiRicoverati);

// GET /pazienti - Ottiene tutti i pazienti (storico incluso)
router.get('/', authMiddleware, authorize(Ruolo.operatore), pazienteController.getAllPazienti);

// GET /pazienti/:id - Ottiene un singolo paziente
router.get('/:id', authMiddleware, authorize(Ruolo.operatore), validateGetPazienteById, pazienteController.getPazienteById);

// POST /pazienti - Registra un nuovo paziente
router.post('/', authMiddleware, authorize(Ruolo.operatore), validateCreatePaziente, pazienteController.createPaziente);

// PUT /pazienti/:id - Aggiorna i dati anagrafici
router.put('/:id', authMiddleware, authorize(Ruolo.operatore), validateUpdatePaziente, pazienteController.updatePaziente);

// DELETE /pazienti/:id - Dimette il paziente (soft delete)
router.delete('/:id', authMiddleware, authorize(Ruolo.operatore), validateDimettiPaziente, pazienteController.dimettiPaziente);

export default router;