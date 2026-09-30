import { param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazione per GET /assegnazioni/:id
 */
export const validateGetAssegnazioneById = [
    param('id').isInt({ min: 1 }).withMessage("L'ID deve essere un intero positivo"),
    validateRequest,
];
