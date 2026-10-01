import richiestaDAO from '../dao/richiestaDAO';
import pazienteDAO from '../dao/pazienteDAO';
import { richiesta, richiestaAttributes } from '../models/richiesta';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { Op, WhereOptions, Transaction } from 'sequelize';
import assegnazioneDAO from '../dao/assegnazioneDAO';
import { sequelize } from '../utils/database';
import { GruppoSanguigno, Priorita, StatoPaziente, StatoRichiesta } from '../utils/enum';

/**
 * Filtri accettati per le query sulle richieste.
 */
export interface RichiestaFilters {
    stato?: StatoRichiesta;
    priorita?: Priorita;
    gruppo_sanguigno?: GruppoSanguigno;
}

/**
 * Repository per la gestione delle richieste.
 */
class RichiestaRepository {

    /**
     * Restituisce tutte le richieste con i dati del paziente associato.
     * Supporta filtri combinabili su stato, priorità e gruppo sanguigno del paziente.
     */
    public async getAllRichieste(filters: RichiestaFilters = {}) {
        const fullPazienti = await pazienteDAO.getAll();

        //Controllo se ci sono i filtri passati con la richiesta
        const pazienti = filters.gruppo_sanguigno ? fullPazienti.filter(p => p.gruppo_sanguigno === filters.gruppo_sanguigno) : fullPazienti;

        if (pazienti.length === 0) {
            return []; // se non ci sono pazienti ritorno l'array vuoto
        }
        const mappaPazienti = new Map(pazienti.map(p => [p.id, p]));

        // Richieste dei soli pazienti trovati (tramite richiestaDAO), filtrate per stato e priorità
        const whereRichiesta: WhereOptions<richiestaAttributes> = {
            id_paziente: { [Op.in]: [...mappaPazienti.keys()] }
        };
        if (filters.stato) whereRichiesta.stato = filters.stato;
        if (filters.priorita) whereRichiesta.priorita = filters.priorita;

        const richieste = await richiestaDAO.getAll(whereRichiesta);

        //Ordinamento delle richieste
        richieste.sort((a, b) => {
            //1. Prima le richieste urgenti
            if (a.priorita === Priorita.urgente && b.priorita === Priorita.normale) return -1;
            if (a.priorita === Priorita.normale && b.priorita === Priorita.urgente) return 1;

            return b.data_richiesta!.getTime() - a.data_richiesta!.getTime();
        });

        //Aggiungiamo alle richieste il rispettivo paziente
        return richieste.map(r => {
            const p = mappaPazienti.get(r.id_paziente)!;
            return {
                ...r.toJSON(),
                id_paziente_paziente: {
                    id: p.id,
                    nome: p.nome,
                    cognome: p.cognome,
                    gruppo_sanguigno: p.gruppo_sanguigno,
                    codice_paziente: p.codice_paziente
                }
            };
        });
    }

    /**
     * Restituisce una singola richiesta con i dati del paziente inclusi.
     * Lancia NotFound se non esiste.
     */
    public async getRichiestaById(id: number) {
        //Recuperiamo la richiesta specifica
        const r = await richiestaDAO.getById(id);
        if(!r){
            throw ErrorFactory.createError(ErrorTypes.NotFound, `Richiesta con ID ${id} non trovata`);
        }
        //Recuperiamo il paziente
        const p = await pazienteDAO.getById(r.id_paziente);
        if(!p){
            throw ErrorFactory.createError(ErrorTypes.InternalServerError, `Errore interno nel recupero paziente`);
        }

        //Uniamo la richiesta con i dati del suo paziente
        return {
            ...r.toJSON(),
            id_paziente_paziente: {
                id: p.id,
                nome: p.nome,
                cognome: p.cognome,
                gruppo_sanguigno: p.gruppo_sanguigno,
                codice_paziente: p.codice_paziente
            }
        };
    }

    /**
     * Crea una nuova richiesta.
     * Verifica prima che il paziente esista (pazienteDAO.getById restituisce null
     * se l'id non esiste) e sia ancora ricoverato.
     * L'id_utente viene passato dal controller (estratto dal token JWT).
     * La riga del paziente viene bloccata con FOR UPDATE.
     */
    public async creaRichiesta(id_paziente: number, quantita: number, priorita: Priorita, id_utente: number): Promise<richiesta> {
        const t = await sequelize.transaction();
        try {
            const pazienteTrovato = await pazienteDAO.getByIdForUpdate(id_paziente, { transaction: t });

            if (!pazienteTrovato) {
                throw ErrorFactory.createError(ErrorTypes.NotFound, `Paziente con ID ${id_paziente} non trovato`);
            }

            if (pazienteTrovato.stato !== StatoPaziente.ricoverato) {
                throw ErrorFactory.createError(
                    ErrorTypes.BadRequest,
                    `Il paziente con ID ${id_paziente} risulta dimesso, non è possibile registrare una nuova richiesta`
                );
            }

            const nuova = await richiestaDAO.create({ id_paziente, quantita, priorita, id_utente }, { transaction: t });
            // reload() necessario per risolvere il literal SQL CURRENT_TIMESTAMP in memoria
            await nuova.reload({ transaction: t });
            await t.commit();
            return nuova;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Recupera le richieste pendenti (in_attesa o non_soddisfatta) con il paziente e le assegnazioni già fatte.
     * Usato dal ricalcolo del flusso, dentro la sua transazione.
     */
    public async getPendentiWithPaziente(options?: { transaction?: Transaction }) {
        // 1. recupero le richieste pendenti tramite dao
        const pendenti = await richiestaDAO.getAll(
            { stato: { [Op.in]: [StatoRichiesta.in_attesa, StatoRichiesta.non_soddisfatta] } },
            options
        );
        if(pendenti.length === 0){
            return [];
        }

        // 2. Recupero i pazienti
        const pazienti = await pazienteDAO.getAll();
        const mappaPazienti = new Map(pazienti.map(p => [p.id,p]));

        // 3. Assegnazioni già fatte alle richieste pendenti
        const idPendenti = new Set(pendenti.map(r => r.id));
        const assegnazioni = (await assegnazioneDAO.getAll()).filter(a => idPendenti.has(a.id_richiesta));

        // 4. Ritorno a ogni richiesta il paziente e le sue assegnazioni
        return pendenti.map(r => ({
            ...r.toJSON(),
            id_paziente_paziente: mappaPazienti.get(r.id_paziente)!,
            assegnaziones: assegnazioni.filter(a => a.id_richiesta === r.id)
        }));
    }
}

export default new RichiestaRepository();