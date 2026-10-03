import {Request, Response, NextFunction} from 'express';
import pazienteDAO from '../dao/pazienteDAO';
import pazienteRepository from '../repositories/pazienteRepository';
import { StatusCodes } from 'http-status-codes';

/**
 * Ottiene tutti i pazienti.
 */
export const getAllPazienti = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pazienti = await pazienteDAO.getAll();
        res.status(StatusCodes.OK).json(pazienti);
    } catch (error) {
        next(error);
    }
};

/**
 * Ottiene tutti i pazienti ancora ricoverati.
 */

export const getAllPazientiRicoverati = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pazienti = await pazienteDAO.getAllRicoverati();
        res.status(StatusCodes.OK).json(pazienti);
    } catch (error) {
        next(error);
    }
};

/**
 * Ottiene un singolo paziente tramite il suo ID.
 * Lancia un NotFound se il paziente non esiste.
 */

export const getPazienteById = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        const paziente = await pazienteRepository.getById(id);
        res.status(StatusCodes.OK).json(paziente);
    } catch (error) {
        next(error);
    }
};

/**
 * Crea un nuovo paziente.
 */
export const createPaziente = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {nome, cognome, data_nascita, gruppo_sanguigno } = req.body;
        const nuovoPaziente = await pazienteRepository.creaPaziente({nome, cognome, data_nascita, gruppo_sanguigno });
        res.status(StatusCodes.CREATED).json(nuovoPaziente);
    } catch (error) {
        next(error);
    }
};

/**
 * Aggiorna i dati anagrafici di un paziente esistente.
 * Lancia un NotFound se il paziente non esiste.
 */
export const updatePaziente = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        const { nome, cognome, data_nascita, gruppo_sanguigno } = req.body;
        const pazienteAggiornato = await pazienteRepository.aggiornaPaziente(id, { nome, cognome, data_nascita, gruppo_sanguigno });
        res.status(StatusCodes.OK).json(pazienteAggiornato);
    } catch (error) {
        next(error);
    }
};

/**
 * Dimette un paziente (soft delete: stato -> 'dimesso').
 * Lancia un NotFound se il paziente non esiste, un BadRequest se ha richieste pendenti.
 */
export const dimettiPaziente = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        await pazienteRepository.dimettiPaziente(id);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};