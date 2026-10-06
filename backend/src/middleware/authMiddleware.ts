import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { Ruolo } from '../utils/enum';
import { redisClient } from '../utils/redis';
import { blacklistKey, versioneUtenteKey } from '../utils/tokenHash';
export {Ruolo};

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload & { id: number; email: string; ruolo: Ruolo };
    token?: string;
}

/**
 * Middleware 1 — Autenticazione JWT.
 * Verifica il token Bearer, controlla su Redis che non sia stato invalidato
 * (logout o revoca dell'utente) e popola req.user e req.token.
 */
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const token = splittedRawToken[1];

    // 1. Verifica firma e scadenza del token
    let decoded: JwtPayload;
    try {
        decoded = verifyToken(token);
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            next(ErrorFactory.createError(ErrorTypes.TokenExpired, 'Token scaduto'));
        } else if (err.name === 'JsonWebTokenError' || err instanceof SyntaxError) {
            next(ErrorFactory.createError(ErrorTypes.JsonWebTokenError, 'Token malformato'));
        } else {
            next(ErrorFactory.createError(ErrorTypes.InvalidToken, 'Token non valido'));
        }
        return;
    }

    // 2. Verifica su Redis che il token non sia stato invalidato
    try {
        // 2a. Logout: il token è in blacklist
        if (await redisClient.exists(blacklistKey(token))) {
            next(ErrorFactory.createError(ErrorTypes.Unauthorized, 'Token revocato'));
            return;
        }

        // 2b. Revoca per utente (cambio ruolo, eliminazione): la versione del token è superata
        const versioneAttuale = Number(await redisClient.get(versioneUtenteKey(decoded.id))) || 0;
        if ((decoded.versione ?? 0) !== versioneAttuale) {
            next(ErrorFactory.createError(ErrorTypes.Unauthorized, 'Sessione non più valida, effettua di nuovo il login'));
            return;
        }
    } catch (err) {
        next(err); // Redis non raggiungibile: errore 500 gestito dall'errorHandler
        return;
    }

    req.user = decoded as JwtPayload & { id: number; email: string; ruolo: Ruolo };
    req.token = token;
    next();
};

/**
 * Middleware 2 — Autorizzazione per ruolo.
 * Restituisce un middleware che verifica che il ruolo dell'utente sia tra quelli ammessi
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