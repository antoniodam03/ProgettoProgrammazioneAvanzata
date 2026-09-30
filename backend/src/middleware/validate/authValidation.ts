import { body } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

export const validateLogin = [
    body('email').isString().withMessage('L\'email deve essere una stringa').bail().trim().isEmail().withMessage('Devi inserire un\'email valida'),
    body('password').isString().withMessage('La password deve essere una stringa').bail().notEmpty().withMessage('La password è obbligatoria'),
    validateRequest
];
