/**
 * Motore Min-Cost Max-Flow, generico.
 *
 * Non conosce nulla del dominio applicativo (pazienti, gruppi sanguigni,
 * priorità): riceve solo nodi numerici, archi con capacità e costo, e
 * restituisce il flusso di costo minimo che massimizza la portata totale.
 *
 */

interface Edge {
    from: number;
    to: number;
    cap: number;   // capacità massima dell'arco
    cost: number;  // costo per unità di flusso su questo arco
    flow: number;  // flusso attualmente instradato
}

export interface FlowResultEdge {
    from: number;
    to: number;
    flow: number;
    cost: number;
}

export interface MinCostMaxFlowResult {
    maxFlow: number;
    totalCost: number;
    /** Solo gli archi "in avanti" (non quelli residui) con flusso > 0. */
    edges: FlowResultEdge[];
}

export class MinCostMaxFlow {
    private readonly numNodes: number;
    private readonly edges: Edge[] = [];
    private readonly adjacency: number[][];

    constructor(numNodes: number) {
        this.numNodes = numNodes;
        this.adjacency = Array.from({ length: numNodes }, () => []);
    }

    /**
     * Aggiunge un arco diretto da `from` a `to`, con la relativa capacità
     * e il costo per unità di flusso. Crea automaticamente anche l'arco
     * residuo (di ritorno), necessario per il funzionamento dell'algoritmo.
     */
    public addEdge(from: number, to: number, capacity: number, cost: number): void {
        this.adjacency[from].push(this.edges.length);
        this.edges.push({ from, to, cap: capacity, cost, flow: 0 });

        this.adjacency[to].push(this.edges.length);
        this.edges.push({ from: to, to: from, cap: 0, cost: -cost, flow: 0 });
    }

    /**
     * Risolve il problema di flusso: trova il flusso massimo da `source`
     * a `sink` che minimizza il costo totale, tra tutti i flussi massimi
     * possibili.
     */
    public solve(source: number, sink: number): MinCostMaxFlowResult {
        let maxFlow = 0;
        let totalCost = 0;

        while (true) {
            const { dist, parentEdge } = this.shortestPath(source);

            if (dist[sink] === Infinity) {
                break; // nessun cammino aumentante residuo: flusso massimo raggiunto
            }

            // Calcola il "collo di bottiglia" (capacità residua minima) lungo il cammino trovato
            let pathFlow = Infinity;
            let v = sink;
            while (v !== source) {
                const edge = this.edges[parentEdge[v]];
                pathFlow = Math.min(pathFlow, edge.cap - edge.flow);
                v = edge.from;
            }

            // Instrada `pathFlow` unità lungo il cammino, aggiornando anche gli archi residui
            v = sink;
            while (v !== source) {
                const edgeIdx = parentEdge[v];
                this.edges[edgeIdx].flow += pathFlow;
                this.edges[edgeIdx ^ 1].flow -= pathFlow; // l'arco residuo è sempre l'adiacente per indice (coppie 0-1, 2-3, ...)
                v = this.edges[edgeIdx].from;
            }

            maxFlow += pathFlow;
            totalCost += pathFlow * dist[sink];
        }

        const usedEdges: FlowResultEdge[] = this.edges
            .filter((edge, index) => index % 2 === 0 && edge.flow > 0) // solo archi "in avanti" con flusso reale
            .map(edge => ({ from: edge.from, to: edge.to, flow: edge.flow, cost: edge.cost }));

        return { maxFlow, totalCost, edges: usedEdges };
    }

    /**
     * Bellman-Ford (variante SPFA con coda) per trovare il cammino di costo
     * minimo da `source` a tutti i nodi, nel grafo residuo corrente.
     * Necessario perché gli archi residui potrebbero avere
     * costo negativo.
     */
    private shortestPath(source: number): { dist: number[]; parentEdge: number[] } {
        const dist = new Array(this.numNodes).fill(Infinity);
        const parentEdge = new Array(this.numNodes).fill(-1);
        const inQueue = new Array(this.numNodes).fill(false);

        dist[source] = 0; //Partiamo dal nodo fittizio sorgente
        const queue: number[] = [source];
        inQueue[source] = true;

        while (queue.length > 0) {
            const u = queue.shift()!;
            inQueue[u] = false;

            for (const edgeIdx of this.adjacency[u]) {
                const edge = this.edges[edgeIdx];
                const residualCapacity = edge.cap - edge.flow;

                if (residualCapacity > 0 && dist[u] + edge.cost < dist[edge.to]) {
                    dist[edge.to] = dist[u] + edge.cost;
                    parentEdge[edge.to] = edgeIdx;

                    if (!inQueue[edge.to]) {
                        queue.push(edge.to);
                        inQueue[edge.to] = true;
                    }
                }
            }
        }

        return { dist, parentEdge };
    }
}