import utenteDAO from '../dao/utenteDAO';
import { verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { Ruolo, RuoloUtente } from '../utils/enum';
import {randomUUID} from "crypto";
import {redisClient} from "../utils/redis";
import {blacklistKey, versioneUtenteKey} from "../utils/tokenHash";

/**
 * Service per l'autenticazione degli utenti.
 */
class AuthService {

    /**
     * Verifica le credenziali e restituisce un token JWT.
     * Lancia Unauthorized con lo stesso messaggio sia se l'email non esiste
     * sia se la password è errata, per non rivelare quali email sono registrate.
     */
    public async login(email: string, password: string): Promise<{ token: string, ruolo: RuoloUtente }> {
        // Cerca l'utente, incluso l'hash della password per la verifica
        const user = await utenteDAO.findByEmailWithPassword(email);
        if (!user) {
            throw ErrorFactory.createError(ErrorTypes.Unauthorized, 'Credenziali non valide');
        }

        // Verifica la password tramite bcrypt
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            throw ErrorFactory.createError(ErrorTypes.Unauthorized, 'Credenziali non valide');
        }

        // Verifica versione attuale token in redis. Se 0 non è mai stata revocata
        const versione = Number(await redisClient.get(versioneUtenteKey(user.id))) || 0;

        // Credenziali corrette: genera il token con il payload
        const token = generateToken({
            id: user.id,
            email: user.email,
            ruolo: Ruolo[user.ruolo],
            versione,
            // Identificativo casuale: rende ogni token unico.
            jti: randomUUID()
        });

        return { token, ruolo: user.ruolo as RuoloUtente };
    }

    /**
     * Invalida il token inserendo il suo hash nella blacklist su Redis.
     * La chiave scade nello stesso istante del token (EXAT = exp).
     */
    public async logout(token: string, exp: number): Promise<void> {
        await redisClient.set(blacklistKey(token), '1', {
            expiration: { type: 'EXAT', value: exp }
        });
    }

    /**
     * Invalida tutti i token già emessi per un utente (dopo cambio ruolo o eliminazione):
     * incrementa la versione, e il middleware rifiuterà i token con una versione diversa.
     */
    public async revocaTokenUtente(idUtente: number): Promise<void> {
        await redisClient.incr(versioneUtenteKey(idUtente));
    }
}

export default new AuthService();
