/**
 * Interfaccia generica per le operazioni di sola lettura.
 * T - Il tipo dell'entità
 * K - Il tipo della chiave primaria
 */
export interface ReadDAO<T, K> {
    getAll(): Promise<T[]>;
    getById(id: K): Promise<T | null>;
}

/**
 * Interfaccia generica per le operazioni CRUD complete:
 * estende la lettura con creazione, modifica ed eliminazione.
 */
export interface DAO<T, K> extends ReadDAO<T, K> {
    create(item: Partial<T>): Promise<T>;
    update(id: K, item: Partial<T>): Promise<T | null>;
    delete(id: K): Promise<number>;
}
