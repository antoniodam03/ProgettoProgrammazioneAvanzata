import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Esegue l'hashing di una password in chiaro.
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifica che una password in chiaro corrisponda al suo hash nel database.
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};
