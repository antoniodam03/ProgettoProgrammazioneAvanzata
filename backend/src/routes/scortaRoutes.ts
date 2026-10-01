import { Router } from 'express';
import { authMiddleware, authorize, Ruolo } from '../middleware/authMiddleware';

import * as scortaController from '../controllers/scortaController';
import {
    validateGetScortaById,
    validateUpdateScorta
} from '../middleware/validate/scortaValidation';

const router = Router();

// ==========================================
// ROTTE SCORTE
// ==========================================

// GET /scorte - Visualizza tutte le scorte 
router.get('/', authMiddleware, authorize(Ruolo.admin), scortaController.getAllScorte);

// GET /scorte/:id - Visualizza una singola scorta
router.get('/:id', authMiddleware, authorize(Ruolo.admin), validateGetScortaById, scortaController.getScortaById);

// PUT /scorte/:id - Aggiorna la quantità di una scorta (solo admin)
router.put('/:id', authMiddleware, authorize(Ruolo.admin), validateUpdateScorta, scortaController.updateScorta);

export default router;
