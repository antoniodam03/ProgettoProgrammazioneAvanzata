import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errorFactory';

/**
 * Middleware globale per la gestione degli errori.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Verifica l'istanza, il nome o l'esistenza della proprietà statusCode
    if (err instanceof HttpError || err.name === 'HttpError' || err.statusCode) {
        res.status(err.statusCode || 500).json({
            error: {
                statusCode: err.statusCode || 500,
                code: err.code || 'UNKNOWN_ERROR',
                message: err.message,
            },
        });
        return;
    }

    // Errore generico non previsto
    console.error('[Errore non gestito]', err);
    res.status(500).json({
        error: {
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Si è verificato un errore interno del server',
        },
    });
};