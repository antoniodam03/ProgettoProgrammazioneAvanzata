import assegnazioneDAO from "../dao/assegnazioneDAO";
import { assegnazione } from "../models/assegnazione";
import { ErrorFactory, ErrorTypes } from "../utils/errorFactory";

/**
 * Repository per la gestione delle assegnazioni
 */

class AssegnazioneRepository{
    /**
     * Restituisce una assegnazione tramite il suo ID
     * Lancia NotFound se l'assegnazione non esiste
     */
    public async getById(id : number) : Promise<assegnazione>{
        const a = await assegnazioneDAO.getById(id);
        if(!a){
            throw ErrorFactory.createError(ErrorTypes.NotFound, `Assegnazione con ID ${id} non trovata`);
        }
        return a;
    }

}

export default new AssegnazioneRepository();