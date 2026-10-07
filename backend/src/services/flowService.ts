import { sequelize } from '../utils/database';
import scortaDAO from '../dao/scortaDAO';
import richiestaRepository from '../repositories/richiestaRepository';
import richiestaDAO from '../dao/richiestaDAO';
import assegnazioneDAO from '../dao/assegnazioneDAO';
import { MinCostMaxFlow } from '../graph/minCostMaxFlow';
import { GruppoSanguigno, Priorita, StatoRichiesta } from '../utils/enum';



// Mappa di compatibilità: chi può DONARE a chi (Scorta -> Paziente)
const COMPATIBILITA: Record<GruppoSanguigno, GruppoSanguigno[]> = {
    [GruppoSanguigno.ZERO]: [GruppoSanguigno.ZERO, GruppoSanguigno.A, GruppoSanguigno.B, GruppoSanguigno.AB],
    [GruppoSanguigno.A]: [GruppoSanguigno.A, GruppoSanguigno.AB],
    [GruppoSanguigno.B]: [GruppoSanguigno.B, GruppoSanguigno.AB],
    [GruppoSanguigno.AB] : [GruppoSanguigno.AB]
};

/**
 * Calcola il "costo" di una trasfusione.
 * Costo minore = priorità maggiore.
 * Sangue identico costa 1. Sangue 0 donato ad altri costa 10 (per disincentivarne l'uso se non necessario).
 */
function getCosto(donatore: GruppoSanguigno, ricevente: GruppoSanguigno): number {
    if (donatore === ricevente) return 1;
    if (donatore === GruppoSanguigno.ZERO) return 10; // Donatore universale, cerchiamo di preservarlo
    return 5; // A -> AB o B -> AB
}

export class FlowService {
    /**
     * Ricalcola tutte le assegnazioni per le richieste in attesa o parzialmente soddisfatte.
     * Esegue in due fasi: prima le richieste urgenti, poi quelle normali.
     */
    static async recompute(): Promise<void> {
        const transaction = await sequelize.transaction();
        
        try {
            // 1. Leggiamo le scorte disponibili con LOCK per evitare scritture concorrenti
            const scorteRaw = await scortaDAO.getAllForUpdate({ transaction });
            
            // Lavoriamo su copie in memoria delle quantità
            const scorteDisp = scorteRaw.map(s => ({
                id: s.id,
                gruppo: s.gruppo_sanguigno as GruppoSanguigno,
                quantita: s.quantita
            }));

            // 2. Leggiamo le richieste pendenti (in_attesa o non_soddisfatta) con i dati del paziente e assegnazioni passate
            const richiesteRaw = await richiestaRepository.getPendentiWithPaziente({ transaction });
            //---
 
            const richiesteInput = richiesteRaw.map(r => {
                const p = r.id_paziente_paziente;
                const assegnazioniPassate = r.assegnaziones || [];
                const quantitaGiaAssegnata = assegnazioniPassate.reduce((sum, a) => sum + a.quantita_assegnata, 0);
                const quantitaMancante = r.quantita - quantitaGiaAssegnata;

                return {
                    id: r.id,
                    gruppo_paziente: p.gruppo_sanguigno as GruppoSanguigno,
                    quantita: r.quantita,
                    priorita: r.priorita,
                    quantita_mancante: quantitaMancante > 0 ? quantitaMancante : 0
                };
            }).filter(r => r.quantita_mancante > 0);

            //---

            if (richiesteInput.length === 0) {
                console.log('[FlowService] Nessuna richiesta pendente da ricalcolare.');
                await transaction.commit();
                return;
            }

            // Separiamo urgenti e normali
            const richiesteUrgenti = richiesteInput.filter(r => r.priorita === Priorita.urgente);
            const richiesteNormali = richiesteInput.filter(r => r.priorita === Priorita.normale);

            const nuoveAssegnazioni: { id_richiesta: number, id_scorta: number, quantita_assegnata: number }[] = [];

            // 3. FASE 1: Risolviamo prima le urgenti
            this.runFlowPhase(scorteDisp, richiesteUrgenti, nuoveAssegnazioni);

            // 4. FASE 2: Risolviamo le normali con il residuo delle scorte
            this.runFlowPhase(scorteDisp, richiesteNormali, nuoveAssegnazioni);

            // 5. APPLICAZIONE SU DB
            
            if (nuoveAssegnazioni.length > 0) {
                // a. Inseriamo le nuove assegnazioni (bulkCreate)
                await assegnazioneDAO.bulkCreate(nuoveAssegnazioni, { transaction });

                // b. Aggiorniamo le scorte (decrementiamo le quantità usate)
                const decrementiScorte = new Map<number, number>();
                for (const ass of nuoveAssegnazioni) {
                    decrementiScorte.set(ass.id_scorta, (decrementiScorte.get(ass.id_scorta) || 0) + ass.quantita_assegnata);
                }

                // Scorro l'intera map
                
                for (const [id_scorta, decremento] of decrementiScorte.entries()) {
                    const scortaCorrente = scorteRaw.find(s => s.id === id_scorta);
                    if (scortaCorrente) {
                        await scortaDAO.update(id_scorta, { quantita: scortaCorrente.quantita - decremento }, { transaction });
                    }
                }

                // c. Aggiorniamo lo stato delle richieste (soddisfatta / non_soddisfatta)
                const incrementiRichieste = new Map<number, number>();
                for (const ass of nuoveAssegnazioni) {
                    incrementiRichieste.set(ass.id_richiesta, (incrementiRichieste.get(ass.id_richiesta) || 0) + ass.quantita_assegnata);
                }

                for (const req of richiesteInput) {
                    const nuovoAssegnato = incrementiRichieste.get(req.id) || 0;
                    if (nuovoAssegnato > 0) {
                        const stato = req.quantita_mancante === 0 ? StatoRichiesta.soddisfatta : StatoRichiesta.non_soddisfatta;
                        await richiestaDAO.update(req.id, { stato }, { transaction });
                    }
                }
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('[FlowService] Errore durante il ricalcolo:', error);
            throw error;
        }
    }

    /**
     * Costruisce il grafo per un sottoinsieme di richieste e aggiorna lo stato in memoria.
     */
    private static runFlowPhase(
        scorteDisp: { id: number, gruppo: GruppoSanguigno, quantita: number }[],
        richieste: { id: number, gruppo_paziente: GruppoSanguigno, quantita_mancante: number }[],
        risultatoAssegnazioni: { id_richiesta: number, id_scorta: number, quantita_assegnata: number }[]
    ) {
        if (richieste.length === 0) return;

        // Nodi:
        // 0: Source (S)
        // 1: Sink (T)
        // 2 a 2+N-1: Nodi Scorta
        // 2+N a 2+N+M-1: Nodi Richiesta
        const S = 0;
        const T = 1;
        const offsetScorte = 2;
        const offsetRichieste = 2 + scorteDisp.length;
        const numNodes = offsetRichieste + richieste.length;

        const mcmf = new MinCostMaxFlow(numNodes);

        // Archi S -> Scorte
        scorteDisp.forEach((scorta, index) => {
            if (scorta.quantita > 0) {
                mcmf.addEdge(S, offsetScorte + index, scorta.quantita, 0);
            }
        });

        // Archi Richieste -> T
        richieste.forEach((req, index) => {
            if (req.quantita_mancante > 0) {
                mcmf.addEdge(offsetRichieste + index, T, req.quantita_mancante, 0);
            }
        });

        // Archi Scorte -> Richieste (se compatibili)
        scorteDisp.forEach((scorta, sIndex) => {
            if (scorta.quantita === 0) return;

            richieste.forEach((req, rIndex) => {
                if (req.quantita_mancante === 0) return;

                const compatibili = COMPATIBILITA[scorta.gruppo];
                if (compatibili.includes(req.gruppo_paziente)) {
                    const costo = getCosto(scorta.gruppo, req.gruppo_paziente);
                    mcmf.addEdge(offsetScorte + sIndex, offsetRichieste + rIndex, Infinity, costo);
                }
            });
        });

        // Risolvi il grafo
        const result = mcmf.solve(S, T);

        // Estrai i flussi
        for (const edge of result.edges) {
            // Controlla se l'arco va da una Scorta a una Richiesta
            if (edge.from >= offsetScorte && edge.from < offsetRichieste && 
                edge.to >= offsetRichieste && edge.to < numNodes) {
                
                const sIndex = edge.from - offsetScorte;
                const rIndex = edge.to - offsetRichieste;
                
                const scorta = scorteDisp[sIndex];
                const req = richieste[rIndex];

                risultatoAssegnazioni.push({
                    id_richiesta: req.id,
                    id_scorta: scorta.id,
                    quantita_assegnata: edge.flow
                });

                // Aggiorna le quantità residue in memoria per la prossima fase
                scorta.quantita -= edge.flow;
                req.quantita_mancante -= edge.flow;
            }
        }
    }
}