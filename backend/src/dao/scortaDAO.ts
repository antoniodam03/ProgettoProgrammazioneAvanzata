import { scorta, scortaAttributes } from '../models/scorta';
import { ReadDAO } from './daoInterface';
import { Transaction } from 'sequelize';

/**
 * DAO per le operazioni sulla tabella scorta.
 * Le scorte sono fisse (una per gruppo sanguigno): si leggono e si aggiorna la quantità,
 * ma non si creano né si eliminano.
 */
class ScortaDAO implements ReadDAO<scortaAttributes, number> {

    /**
     * Restituisce tutte le scorte per gruppo sanguigno.
     */
    public async getAll(): Promise<scorta[]> {
        return await scorta.findAll();
    }

    /**
     * Restituisce tutte le scorte bloccandole con FOR UPDATE.
     * Usato nel ricalcolo del flusso, dentro la sua transaction.
     */
    public async getAllForUpdate(options?: { transaction?: Transaction }): Promise<scorta[]> {
        return await scorta.findAll({
            ...options,
            lock: options?.transaction?.LOCK?.UPDATE
        });
    }

    /**
     * Restituisce una scorta tramite il suo ID bloccandola con FOR UPDATE.
     * Usato nell'aggiornamento della quantità.
     */
    public async getByIdForUpdate(id: number, options?: { transaction?: Transaction }): Promise<scorta | null> {
        return await scorta.findByPk(id, {
            ...options,
            lock: options?.transaction?.LOCK?.UPDATE
        });
    }

    /**
     * Restituisce una scorta tramite il suo ID, o null se non esiste.
     */
    public async getById(id: number): Promise<scorta | null> {
        return await scorta.findByPk(id);
    }

    /**
     * Aggiorna la quantità di una scorta e il timestamp, e restituisce la scorta aggiornata
     * (oppure null se non esiste).
     */
    public async update(id: number, item: Partial<scortaAttributes>, options?: { transaction?: Transaction }): Promise<scorta | null> {
        await scorta.update(
            { ...item, data_aggiornamento: new Date() },
            { where: { id }, fields: ['quantita', 'data_aggiornamento'], ...options }
        );
        return await scorta.findByPk(id, options);
    }
}

export default new ScortaDAO();
