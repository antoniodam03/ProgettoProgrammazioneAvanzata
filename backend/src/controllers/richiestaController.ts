import { Request, Response, NextFunction } from 'express';
import richiestaRepository, { RichiestaFilters } from '../repositories/richiestaRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { StatusCodes } from 'http-status-codes';
import { eventBus } from '../events/eventbus';
/**
 * Controller per le richieste.
 */

/**
 * Restituisce tutte le richieste con i dati del paziente.
 * 
 */
export const getAllRichieste = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters: RichiestaFilters = {
            stato: req.query.stato as RichiestaFilters['stato'],
            priorita: req.query.priorita as RichiestaFilters['priorita'],
            gruppo_sanguigno: req.query.gruppo_sanguigno as RichiestaFilters['gruppo_sanguigno'],
        };
        const richieste = await richiestaRepository.getAllRichieste(filters);
        res.status(StatusCodes.OK).json(richieste);
    } catch (error) {
        next(error);
    }
};

/**
 * Restituisce una singola richiesta con i dati del paziente.
 */
export const getRichiestaById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        const richiesta = await richiestaRepository.getRichiestaById(id);
        res.status(StatusCodes.OK).json(richiesta);
    } catch (error) {
        next(error);
    }
};

/**
 * Crea una nuova richiesta.
 * L'id_utente viene estratto automaticamente dal token JWT.
 */
export const createRichiesta = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id_paziente, quantita, priorita } = req.body;
        const id_utente = req.user!.id;
        const nuovaRichiesta = await richiestaRepository.creaRichiesta(id_paziente, quantita, priorita, id_utente);

        // Dopo la creazione della richiesta viene emessa la notificha

       eventBus.emit('AGGIORNA_FLUSSO', 'richiesta');

        res.status(StatusCodes.CREATED).json(nuovaRichiesta);
    } catch (error) {
        next(error);
    }
};
