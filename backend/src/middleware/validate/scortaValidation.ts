import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte delle scorte
 */

/**
 * Valore massimo di una colonna INT di MySQL
 */
const MAX_INT = 2147483647;

export const validateGetScortaById = [
    param('id').isInt({ min: 1 }).withMessage("L'ID deve essere un intero positivo"),
    validateRequest
];

export const validateUpdateScorta = [
    param('id').isInt({ min: 1 }).withMessage("L'ID deve essere un intero positivo"),
    body().custom((value, { req }) => {
        const { delta } = req.body;
        if (delta === undefined) {
            throw new Error("È necessario specificare il 'delta' ");
        }
        if (typeof delta !== 'number' || !Number.isInteger(delta)) {
            throw new Error("Il delta deve essere un numero intero");
        }
        if (delta === 0) {
            throw new Error("Il delta non può essere 0");
        }
        if (Math.abs(delta) > MAX_INT) {
            throw new Error(`Il delta deve essere compreso tra -${MAX_INT} e ${MAX_INT}`);
        }
        return true;
    }),
    validateRequest
];