import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * Legge una chiave RSA (formato PEM) dalle variabili d'ambiente caricate dal file .env.
 * Accetta sia la chiave su più righe sia quella su una riga sola con "\n" al posto degli a capo.
 * Se la variabile manca, blocca l'avvio con un messaggio chiaro.
 */
const leggiChiave = (nome: string): string => {
    const valore = process.env[nome];
    if (!valore) {
        throw new Error(`Variabile d'ambiente ${nome} mancante nel file .env`);
    }
    return valore.replace(/\\n/g, '\n');
};

// Chiave privata: firma i token. Chiave pubblica: li verifica.
const privateKey = leggiChiave('JWT_PRIVATE_KEY');
const publicKey = leggiChiave('JWT_PUBLIC_KEY');

/**
 * Genera il token JWT firmato con la chiave privata RSA (RS256).
 * Il token dura 1 ora.
 */
export const generateToken = (payload: object): string => {
    return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
};

/**
 * Verifica il token JWT utilizzando la chiave pubblica RSA.
 */
export const verifyToken = (token: string): JwtPayload => {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    if (typeof decoded === 'string') {
        throw new Error('Payload del token non valido');
    }
    return decoded;
};