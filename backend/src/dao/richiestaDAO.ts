import { richiesta, richiestaAttributes, richiestaCreationAttributes } from '../models/richiesta';
import { DAO } from './daoInterface';
import { Transaction, WhereOptions } from 'sequelize';

/**
 * DAO per le operazioni sulla tabella richiesta.
 */
class RichiestaDAO implements DAO<richiestaAttributes, number> {

    /**
     * Restituisce tutte le richieste con filtri opzionali su stato e priorita.
     * Filtri opzionali serve per il grafo
     */
    public async getAll(where?: WhereOptions<richiestaAttributes>, options?: { transaction?: Transaction }): Promise<richiesta[]> {
        return await richiesta.findAll({
            where,
            ...options
        });
    }



    /**
     * Restituisce una singola richiesta per ID, o null se non esiste.
     */
    public async getById(id: number): Promise<richiesta | null> {
        return await richiesta.findByPk(id);
    }

    /**
     * Crea una nuova richiesta.
     */
    public async create(item: Partial<richiestaAttributes>, options?: { transaction?: Transaction }): Promise<richiesta> {
        return await richiesta.create(
            item as richiestaCreationAttributes,
            options
        );
    }

    /**
     * Aggiorna i campi di una richiesta tramite il suo ID e la restituisce aggiornata,
     * oppure null se non esiste.
     */
    public async update(id: number, item: Partial<richiestaAttributes>, options?: { transaction?: Transaction }): Promise<richiesta | null> {
        await richiesta.update(item, { where: { id }, ...options });
        return await richiesta.findByPk(id, options);
    }

    /**
     * Elimina una richiesta tramite il suo ID e restituisce il numero di righe eliminate (0 se non esiste).
     */
    public async delete(id: number): Promise<number> {
        return await richiesta.destroy({
            where: { id }
        });
    }
}

export default new RichiestaDAO();