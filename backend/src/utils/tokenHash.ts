import { createHash } from 'crypto';

/**
 * Restituisce la chiave Redis della blacklist per un token: l'hash SHA-256 del token, non il token intero.
 */
export const blacklistKey = (token: string): string =>
    `blacklist:${createHash('sha256').update(token).digest('hex')}`;

/**
 * Restituisce la chiave con la versione attuale
 */
export const versioneUtenteKey = (userId: number): string =>
    `versioneUtente:${userId}`;