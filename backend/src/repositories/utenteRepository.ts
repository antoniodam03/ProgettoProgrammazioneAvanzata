import utenteDAO from '../dao/utenteDAO';
import { utente, utenteAttributes } from '../models/utente';
import { hashPassword } from '../utils/password';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { RuoloUtente } from '../utils/enum';

/**
 * Repository per la gestione degli utenti.
 */
class UtenteRepository {

    /**
     * Restituisce un utente tramite il suo ID
     * Lancia notFound se l'utente non esiste
     */
    public async getById(id : number) : Promise<utente>{
        const u = await utenteDAO.getById(id);
        if(!u){
            throw ErrorFactory.createError(ErrorTypes.NotFound, `Utente con ID ${id} non trovato`);
        }
        return u;
    }

    /**
     * Crea un nuovo utente, facendo hash della password.
     * Restituisce l'utente creato ricaricato dal database.
     */
    public async creaUtente(data: { nome: string, cognome: string, username: string, email: string, password: string, ruolo: RuoloUtente }): Promise<utente> {
        try {
            const password_hash = await hashPassword(data.password);

            const nuovoUtente = await utenteDAO.create({
                nome: data.nome,
                cognome: data.cognome,
                username: data.username,
                email: data.email,
                password_hash,
                ruolo: data.ruolo
            });

            await nuovoUtente.reload();

            return nuovoUtente;
        } catch (error) {
                if (error instanceof UniqueConstraintError) {
                const campoDuplicato = error.errors?.[0]?.path ?? 'email o username';
                throw ErrorFactory.createError(
                    ErrorTypes.BadRequest,
                    `Il campo '${campoDuplicato}' è già in uso da un altro utente`
                );
            }
            throw error;
        }
    }

    /**
     * Logica di update ruolo dell'utente
     * Lancia notFound se l'utente non esiste
     */
    public async update(id: number, data: Partial<utenteAttributes>): Promise<utente> {
        try {
            const updatedUtente = await utenteDAO.update(id, data);
            if (!updatedUtente) {
                throw ErrorFactory.createError(ErrorTypes.NotFound, `Utente con ID ${id} non trovato`);
            }
            return updatedUtente;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const campoDuplicato = error.errors?.[0]?.path ?? 'email o username';
                throw ErrorFactory.createError(
                    ErrorTypes.BadRequest,
                    `Il campo '${campoDuplicato}' è già in uso da un altro utente`
                );
            }

            throw error;
        }
    }

    /**
     * Logica di delete dell'utente
     * Lancia notFound se l'utente non esiste
     */
    public async delete(id: number): Promise<void> {
        try {
            const righeEliminate = await utenteDAO.delete(id);
            if (righeEliminate === 0) {
                throw ErrorFactory.createError(ErrorTypes.NotFound, `Utente con ID ${id} non trovato`);
            }
        } catch (error) {
            if (error instanceof ForeignKeyConstraintError) {
                throw ErrorFactory.createError(
                    ErrorTypes.BadRequest,
                    `Impossibile eliminare l'utente con ID ${id}: esistono richieste collegate a questo utente`
                );
            }

            throw error;
        }
    }
    
}

export default new UtenteRepository();