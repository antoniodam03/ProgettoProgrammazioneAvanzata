import { utente, utenteAttributes, utenteCreationAttributes } from '../models/utente';
import { DAO } from './daoInterface';

/**
 * DAO per le operazioni CRUD sulla tabella utente.
 */
class UtenteDAO implements DAO<utenteAttributes,number> {

    /**
     * Restituisce tutti gli utenti.
     * Il campo password_hash viene escluso dalla risposta per sicurezza.
     */
    public async getAll() : Promise<utente[]>{
        return await utente.findAll({
            attributes: {exclude: ['password_hash']}
        });
    }

    /**
     * Restituisce un utente tramite il suo ID, o null se non esiste.
     * Il campo password_hash viene escluso dalla risposta per sicurezza.
     */
       public async getById(id: number): Promise<utente | null> {
        return await utente.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        });
    }


    /**
     * Restituisce un utente tramite la sua email INCLUDENDO il password_hash.
     * Necessario per le fasi di login e verifica credenziali.
     */
    public async findByEmailWithPassword(email: string): Promise<utente | null> {
        return await utente.findOne({
            where: {email}
        });
    }

    /**
     * Crea un nuovo utente.
     */
   public async create(data: Partial<utenteAttributes>): Promise<utente> {
    return await utente.create(data as utenteCreationAttributes);
}

    /**
     * Aggiorna un utente tramite il suo ID e lo restituisce aggiornato (senza password_hash),
     * oppure null se non esiste.
     */
  public async update(id: number, data: Partial<utenteAttributes>): Promise<utente | null> {
    await utente.update(data, { where: { id } });

    return await utente.findByPk(id, {
        attributes: { exclude: ['password_hash'] }
    });
}

    /**
     * Elimina un utente tramite il suo ID e restituisce il numero di righe eliminate (0 se non esiste).
     */
    public async delete(id: number): Promise<number> {
        return await utente.destroy({
            where: {id}
        });
    }
}

export default new UtenteDAO();