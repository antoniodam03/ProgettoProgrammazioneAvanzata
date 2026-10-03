import { Request, Response, NextFunction } from 'express';
import scortaDAO from '../dao/scortaDAO';
import scortaRepository from '../repositories/scortaRepository';
import { StatusCodes } from 'http-status-codes';
import {eventBus} from '../events/eventbus';
/**
 * Restituisce tutte le scorte (una per gruppo sanguigno).
 */
export const getAllScorte = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const scorte = await scortaDAO.getAll();
        res.status(StatusCodes.OK).json(scorte);
    } catch (error) {
        next(error);
    }
};

/**
 * Restituisce una singola scorta tramite il suo ID.
 * Lancia un NotFound se la scorta non esiste.
 */
export const getScortaById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        const scorta = await scortaRepository.getById(id);
        res.status(StatusCodes.OK).json(scorta);
    } catch (error) {
        next(error);
    }
};

/**
 * Aggiorna la quantità di una scorta esistente.
 */
export const updateScorta = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const { delta } = req.body;
    try {
        const scortaAggiornata = await scortaRepository.aggiornaScorta(id, delta);
        //Dopo l'aggiornamento della scorta viene notificato l'evento

        eventBus.emit('AGGIORNA_FLUSSO', 'scorta');

        res.status(StatusCodes.OK).json(scortaAggiornata);
    } catch (error) {
        next(error);
    }
};