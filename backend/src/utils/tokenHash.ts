import { createHash } from 'crypto';

/**
 * Inserisce il token nella blacklist.
 */
export const blacklistKey = (token: string): string =>
    `blacklist:${createHash('sha256').update(token).digest('hex')}`;

/**
 * Restituisce la chiave con la versione attuale
 */
export const versioneUtenteKey = (userId: number): string =>
    `versioneUtente:${userId}`;