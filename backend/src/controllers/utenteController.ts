import { Request, Response, NextFunction } from 'express';
import utenteDAO from '../dao/utenteDAO';
import { StatusCodes } from 'http-status-codes';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { AuthenticatedRequest, Ruolo } from '../middleware/authMiddleware';
import utenteRepository from '../repositories/utenteRepository';

/**
 * Ottiene tutti gli utenti.
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const utenti = await utenteDAO.getAll();
        res.status(StatusCodes.OK).json(utenti);
    } catch (error) {
        next(error);
    }
};

/**
 * Ottiene un singolo utente tramite il suo ID.
 * Lancia un NotFound se l'utente non esiste.
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        const richiedente = req.user!;

        if (richiedente.ruolo !== Ruolo.admin && richiedente.id !== id) {
            return next(ErrorFactory.createError(ErrorTypes.Forbidden, 'Puoi visualizzare solo i tuoi dati'));
        }

        const utente = await utenteRepository.getById(id);
        res.status(StatusCodes.OK).json(utente);
    } catch (error) {
        next(error);
    }
};

/**
 * Modifica il ruolo di un utente esistente.
 * Lancia un NotFound se l'utente non esiste.
 */
export const updateRuolo = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const { ruolo } = req.body;
    try {
        const updateUtente = await utenteRepository.update(id, {ruolo});
        res.status(StatusCodes.OK).json({
            message: `Ruolo aggiornato con successo per l'utente ${id}`,
            utente: updateUtente
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Elimina un utente tramite il suo ID.
 * Lancia un NotFound se l'utente non esiste.
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try{
        await utenteRepository.delete(id);
        return res.status(StatusCodes.NO_CONTENT).send();
    }catch(error){
        return next(error);
    }
};

/**
 * Crea un nuovo utente (solo admin).
 * Esegue l'hashing della password prima di salvare nel DB.
 * La password_hash viene esclusa dalla risposta.
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { nome, cognome, username, email, password, ruolo } = req.body;
    try {
        const nuovoUtente = await utenteRepository.creaUtente({ nome, cognome, username, email, password, ruolo });

        // Rimuove il campo password_hash dalla risposta per sicurezza
        const { password_hash: _, ...utenteResp } = nuovoUtente.toJSON();
        return res.status(StatusCodes.CREATED).json(utenteResp);
    } catch (error) {
        return next(error);
    }
};