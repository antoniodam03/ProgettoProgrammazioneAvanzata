import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';
import { GruppoSanguigno } from '../../utils/enum';

/**
 * Validazioni per le rotte dei pazienti
 */

export const validateGetPazienteById = [
    param('id').isInt({ min: 1 }).withMessage('L\'ID deve essere un intero positivo'),
    validateRequest
];

export const validateCreatePaziente = [
    body('nome').isString().withMessage('Il nome deve essere una stringa').bail().notEmpty().withMessage('Il nome è obbligatorio').isLength({ max: 100 }).withMessage('Il nome non può superare i 100 caratteri'),
    body('cognome').isString().withMessage('Il cognome deve essere una stringa').bail().notEmpty().withMessage('Il cognome è obbligatorio').isLength({ max: 100 }).withMessage('Il cognome non può superare i 100 caratteri'),
    body('data_nascita')
        .optional()
        .isString().withMessage('La data di nascita deve essere una stringa').bail()
        .isDate().withMessage('La data di nascita deve essere una data valida (YYYY-MM-DD)')
        .custom((value) => {
            const inputDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (inputDate > today) {
                throw new Error('La data di nascita non può essere futura');
            }
            return true;
        }),
    body('gruppo_sanguigno').isString().withMessage('Il gruppo sanguigno deve essere una stringa').bail().notEmpty().withMessage('Il gruppo sanguigno è obbligatorio').isIn(Object.values(GruppoSanguigno)).withMessage('Il gruppo sanguigno deve essere A, B, 0 o AB'),
    validateRequest
];

export const validateUpdatePaziente = [
    param('id').isInt({ min: 1 }).withMessage('L\'ID deve essere un intero positivo'),
    body('nome').optional().isString().withMessage('Il nome deve essere una stringa').bail().notEmpty().withMessage('Il nome non può essere vuoto').isLength({ max: 100 }).withMessage('Il nome non può superare i 100 caratteri'),
    body('cognome').optional().isString().withMessage('Il cognome deve essere una stringa').bail().notEmpty().withMessage('Il cognome non può essere vuoto').isLength({ max: 100 }).withMessage('Il cognome non può superare i 100 caratteri'),
    body('data_nascita')
        .optional()
        .isString().withMessage('La data di nascita deve essere una stringa').bail()
        .isDate().withMessage('La data di nascita deve essere una data valida (YYYY-MM-DD)')
        .custom((value) => {
            const inputDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (inputDate > today) {
                throw new Error('La data di nascita non può essere futura');
            }
            return true;
        }),
    body('gruppo_sanguigno').optional().isString().withMessage('Il gruppo sanguigno deve essere una stringa').bail().isIn(Object.values(GruppoSanguigno)).withMessage('Il gruppo sanguigno deve essere A, B, 0 o AB'),
    validateRequest
];

export const validateDimettiPaziente = [
    param('id').isInt({ min: 1 }).withMessage('L\'ID deve essere un intero positivo'),
    validateRequest
];