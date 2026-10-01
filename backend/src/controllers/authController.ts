import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../services/authService';

export class AuthController {
    /**
     * Esegue il login dell'utente e restituisce un token JWT se le credenziali sono corrette.
     * La verifica delle credenziali e la generazione del token sono delegate ad authService.
     */
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password } = req.body;
        try {
            const result = await authService.login(email, password);
            res.status(StatusCodes.OK).json(result);
        } catch (error) {
            next(error);
        }
    }
}
