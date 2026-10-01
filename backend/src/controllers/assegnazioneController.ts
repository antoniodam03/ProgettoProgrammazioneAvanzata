import { Request, Response, NextFunction } from 'express';
import assegnazioneDAO from '../dao/assegnazioneDAO';
import { StatusCodes } from 'http-status-codes';
import assegnazioneRepository from '../repositories/assegnazioneRepository';

/**
 * Restituisce tutte le assegnazioni.
 */
export const getAllAssegnazioni = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assegnazioni = await assegnazioneDAO.getAll();
        res.status(StatusCodes.OK).json(assegnazioni);
    } catch (error) {
        next(error);
    }
};

/**
 * Restituisce una singola assegnazione tramite ID.
 * Lancia un NotFound se l'assegnazione non esiste.
 */
export const getAssegnazioneById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        const assegnazione = await assegnazioneRepository.getById(id);
        res.status(StatusCodes.OK).json(assegnazione);
    } catch (error) {
        next(error);
    }
};