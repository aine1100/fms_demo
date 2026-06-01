import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || `redis://127.0.0.1:${process.env.REDIS_PORT || '7001'}`;
export const redisClient = new Redis(redisUrl);

export const saveRefreshToken = async (userId: number, token: string, expiresInDays = 7) => {
  const ttl = expiresInDays * 24 * 60 * 60; // seconds
  const key = `refresh:${token}`;
  const value = JSON.stringify({ userId, createdAt: new Date().toISOString() });
  await redisClient.set(key, value, 'EX', ttl);
  return { key, value, expiresInSeconds: ttl };
};

export const findRefreshToken = async (token: string) => {
  const key = `refresh:${token}`;
  const val = await redisClient.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
};

export const revokeRefreshToken = async (token: string) => {
  const key = `refresh:${token}`;
  await redisClient.del(key);
};
