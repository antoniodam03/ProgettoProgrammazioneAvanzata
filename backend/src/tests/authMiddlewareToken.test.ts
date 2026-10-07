import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { verifyToken } from '../utils/jwt';
import { redisClient } from '../utils/redis';
import { Response } from 'express';

// verifyToken finto: restituisce sempre questo payload (token valido)
const payload = { id: 1, email: 'admin@ospedale.it', ruolo: 1 };
jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn() }));

// Redis finto: di base il token non è in blacklist e la versione dell'utente è 0
jest.mock('../utils/redis', () => ({
    redisClient: {
        exists: jest.fn().mockResolvedValue(0),
        get: jest.fn().mockResolvedValue(null),
    },
}));

/**
 * Test unitari per il middleware authMiddleware (verifica del token JWT).
 */
describe('authMiddleware', () => {
    const res = {} as Response;

    // Esegue il middleware con l'header Authorization indicato e restituisce req e next
    const esegui = async (authorization?: string) => {
        const req = { headers: { authorization } } as AuthenticatedRequest;
        const next = jest.fn();
        await authMiddleware(req, res, next);
        return { req, next };
    };

    beforeEach(() => (verifyToken as jest.Mock).mockReturnValue(payload));

    test('restituisce 401 se manca l\'header Authorization', async () => {
        const { next } = await esegui();
        expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
    });

    test('restituisce 400 se il token non è di tipo Bearer', async () => {
        const { next } = await esegui('Basic abc123');
        expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
    });

    test('popola req.user e chiama next() se il token è valido', async () => {
        const { req, next } = await esegui('Bearer token-valido');
        expect(req.user).toEqual(payload);
        expect(next).toHaveBeenCalledWith(); // nessun argomento = nessun errore
    });

    test('restituisce 401 se il token è stato invalidato con il logout', async () => {
        (redisClient.exists as jest.Mock).mockResolvedValueOnce(1); // il token è in blacklist
        const { next } = await esegui('Bearer token-revocato');
        expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
    });

    test('restituisce 401 se il ruolo dell\'utente è cambiato dopo il login', async () => {
        (redisClient.get as jest.Mock).mockResolvedValueOnce('1'); // l'utente è stato revocato una volta
        const { next } = await esegui('Bearer token-vecchio');
        expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
    });
});
