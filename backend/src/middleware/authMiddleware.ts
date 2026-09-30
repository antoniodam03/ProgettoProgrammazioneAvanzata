import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { Ruolo } from '../utils/enum';
export {Ruolo};

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload & { id: number; email: string; ruolo: Ruolo };
}

/**
 * Middleware 1 — Autenticazione JWT.
 * Verifica il token Bearer e popola req.user.
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const rawtoken = req.headers.authorization;

    if (!rawtoken) {
        next(ErrorFactory.createError(ErrorTypes.Unauthorized, 'Token di autenticazione non presente nell\'header'));
        return;
    }

    const splittedRawToken = rawtoken.split(' ');
    if (splittedRawToken.length !== 2) {
        next(ErrorFactory.createError(ErrorTypes.InvalidToken, 'Token di autenticazione in un formato non valido'));
        return;
    }

    if (splittedRawToken[0] !== 'Bearer') {
        next(ErrorFactory.createError(ErrorTypes.InvalidToken, 'Il token di autenticazione deve essere di tipo Bearer'));
        return;
    }

    try {
        const decoded = verifyToken(splittedRawToken[1]);
        if (!decoded) {
            next(ErrorFactory.createError(ErrorTypes.InvalidToken, 'Token non valido'));
            return;
        }
        req.user = decoded as JwtPayload & { id: number; email: string; ruolo: Ruolo };
        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            next(ErrorFactory.createError(ErrorTypes.TokenExpired, 'Token scaduto'));
        } else if (err.name === 'JsonWebTokenError' || err instanceof SyntaxError) {
            next(ErrorFactory.createError(ErrorTypes.JsonWebTokenError, 'Token malformato'));
        } else {
            next(ErrorFactory.createError(ErrorTypes.InvalidToken, 'Token non valido'));
        }
    }
};

/**
 * Middleware 2 — Autorizzazione per ruolo.
 * Restituisce un middleware che verifica che il ruolo dell'utente sia
 * ESATTAMENTE tra quelli ammessi
 * @param ruoliAmmessi Uno o più ruoli che possono accedere alla rotta
 */
export const authorize = (...ruoliAmmessi: Ruolo[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user) {
            next(ErrorFactory.createError(ErrorTypes.Unauthorized, 'Utente non autenticato'));
            return;
        }

        if (!ruoliAmmessi.includes(user.ruolo)) {
            next(ErrorFactory.createError(
                ErrorTypes.Forbidden,
                `Accesso negato. Ruoli ammessi: ${ruoliAmmessi.map(r => Ruolo[r]).join(', ')}, ruolo attuale: ${Ruolo[user.ruolo]}`
            ));
            return;
        }

        next();
    };
};