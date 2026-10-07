import { authorize, Ruolo, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn() }));
jest.mock('../utils/redis', () => ({ redisClient: {} }));

/**
 * Test unitari per il middleware authorize (controllo degli accessi per ruolo).
 */
describe('authorize', () => {
    const res = {} as Response;

    // Esegue authorize con il ruolo dell'utente (undefined = utente non autenticato) e restituisce next
    const esegui = (ruoloUtente: Ruolo | undefined, ...ruoliAmmessi: Ruolo[]) => {
        const req = { user: ruoloUtente === undefined ? undefined : { id: 1, ruolo: ruoloUtente } } as AuthenticatedRequest;
        const next = jest.fn();
        authorize(...ruoliAmmessi)(req, res, next);
        return next;
    };

    test('chiama next() senza errori se il ruolo corrisponde esattamente', () => {
        expect(esegui(Ruolo.admin, Ruolo.admin)).toHaveBeenCalledWith();
    });

    test('chiama next() senza errori se il ruolo è incluso tra ruoli multipli', () => {
        expect(esegui(Ruolo.operatore, Ruolo.admin, Ruolo.operatore)).toHaveBeenCalledWith();
    });

    test('restituisce 401 se req.user non è definito', () => {
        expect(esegui(undefined, Ruolo.admin).mock.calls[0][0]).toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
    });

    test('restituisce 403 se un operatore accede a una rotta admin', () => {
        expect(esegui(Ruolo.operatore, Ruolo.admin).mock.calls[0][0]).toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    });

    test('restituisce 403 se un admin accede a una rotta solo per operatore', () => {
        expect(esegui(Ruolo.admin, Ruolo.operatore).mock.calls[0][0]).toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    });
});
