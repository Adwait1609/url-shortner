const Redis = require('ioredis');

const { REDIS_HOST, REDIS_DOCKER_PORT } = process.env;

let client;

function getRedisClient() {
  if (!client) {
    client = new Redis({
      host: REDIS_HOST,
      port: Number(REDIS_DOCKER_PORT),
      maxRetriesPerRequest: null,
    });
  }
  return client;
}

async function connectToRedis() {
  const client = getRedisClient();
  client
    .on('connect', () => console.log('Successfully connected to Redis'))
    .on('error', (error) => console.error('Error on Redis:', error.message));
}

async function set(key, value, expirationMode, seconds) {
  try {
    await getRedisClient().set(key, value, expirationMode, seconds);
    console.info(`Key ${key} created in Redis cache`);
  } catch (error) {
    console.error(`Failed to create key in Redis cache: ${error}`);
  }
}

async function get(key) {
  try {
    const value = await getRedisClient().get(key);
    console.info(`Value with key ${key} retrieved from Redis cache`);
    return value;
  } catch (error) {
    console.error(`Failed to retrieve value with key ${key}: ${error}`);
    return null;
  }
}

async function extendTTL(key, additionalTimeInSeconds) {
  const currentTTL = await getRedisClient().ttl(key);
  if (currentTTL > 0) {
    const newTTL = currentTTL + additionalTimeInSeconds;
    await getRedisClient().expire(key, newTTL);
    console.info(`TTL for key ${key} extended to ${newTTL}`);
  } else {
    console.error(`Failed to extend TTL of key ${key}`);
  }
}

module.exports = { connectToRedis, set, get, extendTTL };