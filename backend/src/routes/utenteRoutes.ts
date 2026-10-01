import { Router } from 'express';
import { authMiddleware, authorize, Ruolo } from '../middleware/authMiddleware';

import * as utenteController from '../controllers/utenteController';
import {
    validateGetUserById,
    validateUpdateRuoloUtente,
    validateDeleteUtente,
    validateCreateUtente
} from '../middleware/validate/utenteValidation';

const router = Router();

// ==========================================
// ROTTE CRUD UTENTI
// ==========================================

// GET /utenti - Ottiene tutti gli utenti (solo admin può vedere tutti gli utenti)
router.get('/', authMiddleware, authorize(Ruolo.admin), utenteController.getAllUsers);

// GET /utenti/:id - Ottiene un singolo utente (solo admin e operatore possono farlo)
router.get('/:id', authMiddleware, authorize(Ruolo.admin,Ruolo.operatore), validateGetUserById, utenteController.getUserById);

// PUT /utenti/:id/ruolo - Aggiorna il ruolo (solo admin può farlo)
router.put('/:id/ruolo', authMiddleware, authorize(Ruolo.admin), validateUpdateRuoloUtente, utenteController.updateRuolo);

// DELETE /utenti/:id - Elimina un utente (solo admin può farlo)
router.delete('/:id', authMiddleware, authorize(Ruolo.admin), validateDeleteUtente, utenteController.deleteUser);

// POST /utenti - Crea un nuovo utente (solo admin può farlo)
router.post('/', authMiddleware, authorize(Ruolo.admin), validateCreateUtente, utenteController.createUser);


export default router;