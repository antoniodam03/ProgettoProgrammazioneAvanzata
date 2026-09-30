import express, { Request, Response, NextFunction } from 'express';
import utenteRoutes from './routes/utenteRoutes';
import authRoutes from './routes/authRoutes';
import pazienteRoutes from './routes/pazienteRoutes';
import scortaRoutes from './routes/scortaRoutes';
import richiestaRoutes from './routes/richiestaRoutes';
import assegnazioneRoutes from './routes/assegnazioneRoutes';
import { errorHandler } from './middleware/errorHandlerMiddleware';
import { ErrorFactory, ErrorTypes } from './utils/errorFactory';
import './events/flowListener';

const app = express();

// Middleware per il parsing del corpo delle richieste in formato JSON
app.use(express.json());

// Rotte
app.use('/auth', authRoutes);
app.use('/utenti', utenteRoutes);
app.use('/pazienti', pazienteRoutes);
app.use('/scorte', scortaRoutes);
app.use('/richieste', richiestaRoutes);
app.use('/assegnazioni', assegnazioneRoutes);

// Middleware per gestire le rotte non trovate
app.use((req: Request, res: Response, next: NextFunction) => {
    next(ErrorFactory.createError(ErrorTypes.NotFound, `Rotta ${req.method} ${req.path} non trovata`));
});

// Middleware globale per la gestione degli errori
app.use(errorHandler);

export default app;
