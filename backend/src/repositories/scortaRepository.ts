import scortaDAO from '../dao/scortaDAO';
import { scorta } from '../models/scorta';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { sequelize } from '../utils/database';

/**
 * Repository per la gestione delle scorte ematiche.
 */
class ScortaRepository {

    /**
     * Restituisce una scorta tramite il suo ID
     * Lancia notFound se la scorta non esiste
     */
    public async getById(id: number): Promise<scorta> {
        const s = await scortaDAO.getById(id);
        if (!s) {
            throw ErrorFactory.createError(ErrorTypes.NotFound, `Scorta con ID ${id} non trovata`);
        }
        return s;
    }

    /**
     * Aggiorna la quantità delle scorte di sangue tramite il delta.
     * Delta positivo per aggiungere sacche e delta negativo per rimuoverle.
     */
    public async aggiornaScorta(id: number, delta: number): Promise<scorta> {
        const t = await sequelize.transaction();

        try {
            // 1. Recupera la scorta corrente con blocco esclusivo FOR UPDATE
            const scortaCorrente = await scortaDAO.getByIdForUpdate(id, { transaction: t });
            if (!scortaCorrente) {
                throw ErrorFactory.createError(ErrorTypes.NotFound, `Scorta con ID ${id} non trovata`);
            }

            // 2. Calcola la nuova quantità
            const nuovaQuantita = scortaCorrente.quantita + delta;

            // 3. REGOLA DI BUSINESS: la quantità non può scendere sotto zero
            if (nuovaQuantita < 0) {
                throw ErrorFactory.createError(
                    ErrorTypes.BadRequest,
                    `Scorte insufficienti. Quantità attuale: ${scortaCorrente.quantita}, variazione richiesta: ${delta}, risultato: ${nuovaQuantita}`
                );
            }

            // 4. Salva tramite DAO nella stessa transazione
            const scortaAggiornata = await scortaDAO.update(id, { quantita: nuovaQuantita }, { transaction: t });
            if (!scortaAggiornata) {
                throw ErrorFactory.createError(ErrorTypes.InternalServerError, `Errore nell'aggiornamento della scorta con ID ${id}`);
            }

            await t.commit();

            return scortaAggiornata;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new ScortaRepository();