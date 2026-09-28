import { createClient } from 'redis';

const redis = createClient({
    url : process.env.REDIS_URL as string,
    password: process.env.REDIS_PASSWORD as string
});

redis.on('error', (err) => console.error('Redis Client Error', err));

export default redis;