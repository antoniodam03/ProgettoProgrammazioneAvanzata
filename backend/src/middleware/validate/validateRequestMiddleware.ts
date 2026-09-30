import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ErrorFactory, ErrorTypes } from '../../utils/errorFactory';

/**
 * Middleware generico che controlla il risultato delle validazioni
 * definite tramite express-validator nelle rotte.
 * Se ci sono errori di validazione, blocca la richiesta e lancia un BadRequest.
 * Se tutto è valido, passa al controller successivo con next().
 */
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        next(ErrorFactory.createError(ErrorTypes.BadRequest, errorMessages));
        return;
    }

    next();
};

export default validateRequest;
