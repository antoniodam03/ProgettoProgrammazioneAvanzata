import {EventEmitter} from 'events';

/**
 * Tipi di evento che fanno partire il ricalcolo del flusso.
 */

export type TipoEvento = 'richiesta' | 'scorta';

/**
 * Definizione degli eventi gestiti dall'EventBus.
 */

type EventiFlusso = {
    AGGIORNA_FLUSSO: [TipoEvento];
    FLUSSO_DA_RICALCOLARE: [];
}

/**
 * Definisco i tempi di attesa per l'EventBus:
 * - scorta : 3 secondi in modo da evitare ricalcoli troppo frequenti in caso di aggiornamenti multipli
 * - richiesta : 0 secondi in modo da avere un ricalcolo più veloce in caso di nuove richieste
 */

const DELAY_MS: Record<TipoEvento, number> = {
    scorta: 3000,
    richiesta: 0
};

/**
 * Definisco la classe eventBus
 */

class BloodBankEventBus extends EventEmitter<EventiFlusso> {
    private debounceTimer: NodeJS.Timeout | null = null;

    constructor() {
        super();
        // Ogni evento emesso dai controller programma un ricalcolo
        this.on('AGGIORNA_FLUSSO', (tipo: TipoEvento) => this.programmaRicalcolo(tipo));
    }

    /**
     * Annulla l'eventuale ricalcolo già programmato e ne programma uno nuovo
     * con il tempo di attesa previsto per il tipo di evento.
     */
    private programmaRicalcolo(tipo: TipoEvento): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        // Richiesta: ricalcolo immediato
        if (DELAY_MS[tipo] === 0) {
            this.emit('FLUSSO_DA_RICALCOLARE');
            return;
        }

        // Scorta: ricalcolo dopo il tempo di attesa, se nel frattempo non arrivano altri eventi
        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = null;
            this.emit('FLUSSO_DA_RICALCOLARE');
        }, DELAY_MS[tipo]);
    }
}

export const eventBus = new BloodBankEventBus();
