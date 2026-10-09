import { Router } from 'express';
import { authMiddleware, authorize, Ruolo } from '../middleware/authMiddleware';
import * as richiestaController from '../controllers/richiestaController';
import {
    validateGetRichieste,
    validateGetRichiestaById,
    validateCreateRichiesta,
    validateAnnullaRichiesta,
} from '../middleware/validate/richiestaValidation';

const router = Router();

// ==========================================
// ROTTE RICHIESTE TRASFUSIONI
// ==========================================

// GET /richieste - Tutte le richieste con dati paziente (accessibile da operatore)
router.get('/', authMiddleware, authorize(Ruolo.operatore), validateGetRichieste, richiestaController.getAllRichieste);

// GET /richieste/:id - Singola richiesta con dati paziente (Accessibile da operatore)
router.get('/:id', authMiddleware, authorize(Ruolo.operatore), validateGetRichiestaById, richiestaController.getRichiestaById);

// POST /richieste - Crea una nuova richiesta (accessibile da operatore)

router.post('/', authMiddleware, authorize(Ruolo.operatore), validateCreateRichiesta, richiestaController.createRichiesta);

// DELETE /richieste/:id - Annulla una richiesta ancora in attesa (accessibile da operatore)
router.delete('/:id', authMiddleware, authorize(Ruolo.operatore), validateAnnullaRichiesta, richiestaController.annullaRichiesta);

export default router;
