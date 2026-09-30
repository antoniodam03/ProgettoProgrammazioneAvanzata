import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';
import { RuoloUtente } from '../../utils/enum';

/**
 * Validazioni per le rotte degli utenti
 */

export const validateGetUserById = [
    param('id').isInt({ min: 1 }).withMessage('L\'ID deve essere un intero positivo'),
    validateRequest
];

export const validateUpdateRuoloUtente = [
    param('id').isInt({ min: 1 }).withMessage('L\'ID deve essere un intero positivo'),
    body('ruolo')
        .isString().withMessage('Il ruolo deve essere una stringa').bail()
        .notEmpty()
        .isIn(Object.values(RuoloUtente))
        .withMessage('Il ruolo deve essere admin o operatore'),
    validateRequest
];

export const validateDeleteUtente = [
    param('id').isInt({ min: 1 }).withMessage('L\'ID deve essere un intero positivo'),
    validateRequest
];

export const validateCreateUtente = [
    body('nome')
        .isString().withMessage('Il nome deve essere una stringa').bail()
        .trim()
        .notEmpty().withMessage('Il nome è obbligatorio')
        .isLength({ max: 100 }).withMessage('Il nome non può superare i 100 caratteri')
        .customSanitizer(value => value.replace(/\s+/g, ' ')),

    body('cognome')
        .isString().withMessage('Il cognome deve essere una stringa').bail()
        .trim()
        .notEmpty().withMessage('Il cognome è obbligatorio')
        .isLength({ max: 100 }).withMessage('Il cognome non può superare i 100 caratteri')
        .customSanitizer(value => value.replace(/\s+/g, ' ')),

    body('username')
        .isString().withMessage('Lo username deve essere una stringa').bail()
        .trim()
        .notEmpty().withMessage('Lo username è obbligatorio')
        .isLength({ max: 100 }).withMessage('Lo username non può superare i 100 caratteri'),

    body('email')
        .isString().withMessage('L\'email deve essere una stringa').bail()
        .trim()
        .toLowerCase()
        .isEmail().withMessage('Devi inserire un\'email valida')
        .isLength({ max: 100 }),

    body('password')
        .isString().withMessage('La password deve essere una stringa').bail()
        .notEmpty().withMessage('La password è obbligatoria')
        .isLength({ min: 6 }).withMessage('La password deve avere almeno 6 caratteri'),

    body('ruolo')
        .optional()
        .isString().withMessage('Il ruolo deve essere una stringa').bail()
        .isIn(Object.values(RuoloUtente))
        .withMessage('Il ruolo deve essere admin o operatore'),

    validateRequest
];