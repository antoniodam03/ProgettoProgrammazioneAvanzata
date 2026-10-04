/**
 * File per la gestione del server e della connessione al database.
 */

import app from './app';
import { sequelize } from './utils/database';
import { redisClient } from './utils/redis';

// Definizione della porta dove il server resta in ascolto
const PORT = process.env.PORT || 3000;

const connectWithRetry = async () => {
    let tentativi = 0;
    while (tentativi < 10) {
        try {
            await sequelize.authenticate();
            console.log('Connessione al DB riuscita');
            // Connessione a Redis (una sola volta: connect() su un client già aperto darebbe errore)
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
            console.log('Connessione a Redis riuscita');
            app.listen(PORT, () => {
                console.log(`Server avviato sulla porta ${PORT}`);
            });
            return;
        } catch (err) {
            tentativi++;
            console.log(`DB non pronto, tentativo ${tentativi}/10... aspetto 3 secondi`);
            await new Promise(res => setTimeout(res, 3000));
        }
    }
    console.error('Impossibile connettersi al DB dopo 10 tentativi');
    process.exit(1);
};

connectWithRetry();