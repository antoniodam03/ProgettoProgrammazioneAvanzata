/**
 * Interfaccia generica per la definizione delle operazioni CRUD.
 * T - Il tipo dell'entità
 * K - Il tipo della chiave primaria
 */
export interface DAO<T, K> {
    getAll(): Promise<T[]>;
    getById(id: K): Promise<T | null>;
    create(item: Partial<T>): Promise<T>;
    update(id: K, item: Partial<T>): Promise<T | null>;
    delete(id: K): Promise<number>;
}