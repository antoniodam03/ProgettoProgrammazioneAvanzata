import { assegnazione, assegnazioneAttributes, assegnazioneCreationAttributes } from '../models/assegnazione';
import { DAO } from './daoInterface';
import { Transaction } from 'sequelize';

/**
 * DAO per le operazioni sulla tabella assegnazione.
 */
class AssegnazioneDAO implements DAO<assegnazioneAttributes, number> {

    /**
     * Restituisce tutte le assegnazioni.
     */
    public async getAll(): Promise<assegnazione[]> {
        return await assegnazione.findAll();
    }

    /**
     * Restituisce una singola assegnazione per ID, o null se non esiste.
     */
    public async getById(id: number): Promise<assegnazione | null> {
        return await assegnazione.findByPk(id);
    }

    /**
     * Crea una nuova assegnazione.
     */
    public async create(item: Partial<assegnazioneAttributes>): Promise<assegnazione> {
        return await assegnazione.create(item as assegnazioneCreationAttributes);
    }

    /**
     * Inserisce assegnazioni in massa.
     */
    public async bulkCreate(items: Partial<assegnazioneAttributes>[], options?: { transaction?: Transaction }): Promise<assegnazione[]> {
        if (items.length === 0) return [];
        return await assegnazione.bulkCreate(items as assegnazioneCreationAttributes[], options);
    }

    /**
     * Aggiorna un'assegnazione tramite il suo ID e la restituisce aggiornata,
     * oppure null se non esiste.
     */
    public async update(id: number, item: Partial<assegnazioneAttributes>): Promise<assegnazione | null> {
        await assegnazione.update(item, { where: { id } });
        return await assegnazione.findByPk(id);
    }

    /**
     * Elimina un'assegnazione tramite il suo ID e restituisce il numero di righe eliminate (0 se non esiste).
     */
    public async delete(id: number): Promise<number> {
        return await assegnazione.destroy({
            where: { id }
        });
    }
}

export default new AssegnazioneDAO();