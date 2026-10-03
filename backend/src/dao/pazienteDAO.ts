import { paziente, pazienteAttributes, pazienteCreationAttributes } from "../models/paziente";
import { StatoPaziente } from "../utils/enum";
import { DAO } from "./daoInterface";
import { Transaction } from "sequelize";

/**
 * DAO per le operazioni CRUD sulla tabella paziente.
 */

class PazienteDAO implements DAO<pazienteAttributes, number> {
    /**
     * Metodo per restituire tutti i pazienti (ricoverati e dimessi -> storico).
     */
    public async getAll(): Promise<pazienteAttributes[]> {
        return await paziente.findAll();
    }

    /**
     * Metodo per restituire solo i pazienti ricoverati
     */

    public async getAllRicoverati(): Promise<pazienteAttributes[]> {
        return await paziente.findAll({
            where: { stato: StatoPaziente.ricoverato }
        });
    }

    /**
     * Restituisce un paziente tramite il suo ID, o null se non esiste.
     */
    public async getById(id: number): Promise<pazienteAttributes | null> {
        return await paziente.findByPk(id);
    }

    /**
     * Restituisce un paziente tramite il suo ID con blocco esclusivo FOR UPDATE, o null se non esiste.
     */
    public async getByIdForUpdate(id: number, options?: { transaction?: Transaction }): Promise<paziente | null> {
        return await paziente.findByPk(id, {
            ...options,
            lock: options?.transaction?.LOCK?.UPDATE
        });
    }

    /**
     * Crea un nuovo paziente nel database.
     */

    public async create(item: pazienteCreationAttributes, options?: { transaction?: Transaction }): Promise<paziente> {
        return await paziente.create(item, options);
    }

    /**
     * Aggiorna un paziente esistente, o restituisce null se non esiste.
     */
    public async update(id: number, item: Partial<pazienteAttributes>, options?: { transaction?: Transaction }): Promise<pazienteAttributes | null> {
        await paziente.update(item, { where: { id }, ...options });
        return await paziente.findByPk(id, options);
    }

    /**
     * Esegue la dimissione del paziente (Soft Delete).
     * Il record rimane nel database per lo storico clinico, ma lo stato passa a 'dimesso'.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        // Soft delete: aggiorniamo lo stato invece di chiamare paziente.destroy()
        const [affectedRows] = await paziente.update(
            { stato: StatoPaziente.dimesso },
            { where: { id }, ...options }
        );
        return affectedRows;
    }
}

export default new PazienteDAO();