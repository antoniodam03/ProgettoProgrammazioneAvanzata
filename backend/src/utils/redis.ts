import {createClient} from "redis";

/**
 * Singleton di redis
 */

class Redis{
    private static instance : ReturnType<typeof createClient>;

    private constructor(){}

    public static getInstance() : ReturnType<typeof createClient>{
        if(!Redis.instance){
            Redis.instance = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                disableOfflineQueue: true
            });
            Redis.instance.on('error', (err) => console.error('Redis Client Error', err));
        }
        return Redis.instance;
    }
}

export const redisClient = Redis.getInstance();
export default Redis;