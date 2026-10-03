import pazienteDAO from '../dao/pazienteDAO';
import richiestaDAO from '../dao/richiestaDAO';
import { pazienteAttributes, pazienteCreationAttributes } from '../models/paziente';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { sequelize } from '../utils/database';
import { Op } from 'sequelize';
import { StatoRichiesta } from '../utils/enum';

/**
 * Repository per la gestione dei pazienti.
 */
class PazienteRepository {
    
    /**
     * Restituisce un paziente tramite ID
     * Lancia NotFound se il paziente non esiste
     */
    public async getById(id : number) : Promise<pazienteAttributes>{
        const p = await pazienteDAO.getById(id);
        if(!p){
            throw ErrorFactory.createError(ErrorTypes.NotFound, `Paziente con ID ${id} non trovato`);
        }
        return p;
    }

    /**
     * Crea un nuovo paziente nel database.
     */
    public async creaPaziente(item: pazienteCreationAttributes): Promise<pazienteAttributes> {
        const t = await sequelize.transaction();
        try{
            // 1. Inserimento del paziente: il database assegna l'id
            const nuovo = await pazienteDAO.create(item, {transaction: t});

            // 2. Assegnazione del codice PZ-<id>, sempre tramite il DAO
            const completo = await pazienteDAO.update(nuovo.id, { codice_paziente: `PZ-${nuovo.id}` }, {transaction: t});
            if(!completo){
                throw ErrorFactory.createError(ErrorTypes.InternalServerError, `Errore nella creazione del paziente`);
            }

            await t.commit();
            return completo;
        }catch(error){
            await t.rollback();
            throw error;
        }
    }

    /**
     * Aggiorna i dati anagrafici di un paziente
     * Lancia NotFound se il paziente non è stato trovate
     */
    public async aggiornaPaziente(id : number, item : Partial<pazienteAttributes>) : Promise<pazienteAttributes>{
        const aggiornato = await pazienteDAO.update(id, item);
        if(!aggiornato){
            throw ErrorFactory.createError(ErrorTypes.NotFound, `Paziente con ID ${id} non trovato`);
        }
        return aggiornato;
    }

    /**
     * Dimette un paziente (soft delete: stato -> 'dimesso').
     * REGOLA: non è possibile dimettere un paziente con richieste pendenti (in_attesa o non_soddisfatta).
     * La riga del paziente viene bloccata con FOR UPDATE, così che nessuna nuova richiesta
     * possa essere creata tra il controllo e la dimissione.
     */
    public async dimettiPaziente(id: number): Promise<void> {
        const t = await sequelize.transaction();
        try {
            const p = await pazienteDAO.getByIdForUpdate(id, { transaction: t });
            if (!p) {
                throw ErrorFactory.createError(ErrorTypes.NotFound, `Paziente con ID ${id} non trovato`);
            }

            const pendenti = await richiestaDAO.getAll(
                { id_paziente: id, stato: { [Op.in]: [StatoRichiesta.in_attesa, StatoRichiesta.non_soddisfatta] } },
                { transaction: t }
            );
            if (pendenti.length > 0) {
                throw ErrorFactory.createError(
                    ErrorTypes.BadRequest,
                    `Impossibile dimettere il paziente con ID ${id}: esistono ${pendenti.length} richieste pendenti (ID: ${pendenti.map(r => r.id).join(', ')})`
                );
            }

            await pazienteDAO.delete(id, { transaction: t });
            await t.commit();
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new PazienteRepository();
