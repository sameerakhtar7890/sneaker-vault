import { createClient } from 'redis';

let redisClient = null;

export function getRedisClient() {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      redisClient.on('error', (err) => console.error('🔴 Redis Client Error:', err));
      redisClient.on('connect', () => console.log('🟢 Redis connecting...'));
      redisClient.on('ready', () => console.log('🟢 Redis connected successfully!'));
    } catch (err) {
      console.error('🔴 Redis createClient failed (invalid REDIS_URL?):', err.message);
      redisClient = null;
    }
  }
  return redisClient;
}

export async function connectRedis() {
  const client = getRedisClient();
  if (!client) {
    console.warn('⚠️  REDIS_URL not set or invalid — Redis caching is disabled');
    return;
  }
  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (err) {
      console.error('🔴 Failed to connect to Redis:', err.message);
      redisClient = null; // reset so app keeps running without Redis
    }
  }
}
