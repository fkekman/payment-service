import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./redis.config";

const redis = new Redis({
  host: REDIS_HOST || '127.0.0.1',
  port: Number(REDIS_PORT) || 6379,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => console.log('Redis connected successfully'));
redis.on('error', (err) => console.error('Redis connection error:', err));

export const client = redis;
