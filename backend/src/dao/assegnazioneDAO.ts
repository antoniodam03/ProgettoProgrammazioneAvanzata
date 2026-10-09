import { assegnazione, assegnazioneAttributes, assegnazioneCreationAttributes } from '../models/assegnazione';
import { ReadDAO } from './daoInterface';
import { Transaction } from 'sequelize';

/**
 * DAO per le operazioni sulla tabella assegnazione.
 * Le assegnazioni vengono create solo dal ricalcolo del flusso (inserimento in blocco)
 * e poi soltanto lette.
 */
class AssegnazioneDAO implements ReadDAO<assegnazioneAttributes, number> {

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
     * Inserisce assegnazioni in massa.
     */
    public async bulkCreate(items: Partial<assegnazioneAttributes>[], options?: { transaction?: Transaction }): Promise<assegnazione[]> {
        if (items.length === 0) return [];
        return await assegnazione.bulkCreate(items as assegnazioneCreationAttributes[], options);
    }
}

export default new AssegnazioneDAO();
