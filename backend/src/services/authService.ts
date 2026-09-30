import utenteDAO from '../dao/utenteDAO';
import { verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ErrorFactory, ErrorTypes } from '../utils/errorFactory';
import { Ruolo, RuoloUtente } from '../utils/enum';
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

        // Credenziali corrette: genera il token con il payload
        const token = generateToken({
            id: user.id,
            email: user.email,
            ruolo: Ruolo[user.ruolo]
        });

        return { token, ruolo: user.ruolo as RuoloUtente };
    }
}

export default new AuthService();
