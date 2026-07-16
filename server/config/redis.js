import { createClient } from 'redis';

let redisClient = null;

export function getRedisClient() {
  if (!redisClient && process.env.REDIS_URL) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });
    redisClient.on('error', (err) => console.error('🔴 Redis Client Error:', err));
    redisClient.on('connect', () => console.log('🟢 Redis connecting...'));
    redisClient.on('ready', () => console.log('🟢 Redis connected successfully!'));
  }
  return redisClient;
}

export async function connectRedis() {
  const client = getRedisClient();
  if (!client) {
    console.warn('⚠️  REDIS_URL not set — Redis caching is disabled');
    return;
  }
  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (err) {
      console.error('🔴 Failed to connect to Redis:', err.message);
    }
  }
}
