const { set, get, extendTTL } = require('../config/redis');
const { generateUniqueToken } = require('../config/zookeeper');
const { isValidUrl } = require('../utils');
const { create, findAll, findOne, updateOne } = require('../repositories/urlsRepository');

const ONE_MINUTE_IN_SECONDS = 60;

async function getAllUrls() {
  return await findAll();
}

async function getUrlByShortenUrlKey(shortenUrlKey) {
  const cachedOriginalUrl = await get(shortenUrlKey);
  if (cachedOriginalUrl) {
    await extendTTL(shortenUrlKey, ONE_MINUTE_IN_SECONDS);
    await updateOne({ shortenUrlKey }, { $inc: { visits: 1 } }); // Stats tracking
    return cachedOriginalUrl;
  }

  const savedUrl = await findOne({ shortenUrlKey });
  if (!savedUrl) throw new Error('Short URL not found');
  await set(savedUrl.shortenUrlKey, savedUrl.originalUrl, 'EX', ONE_MINUTE_IN_SECONDS);
  await updateOne({ shortenUrlKey: savedUrl.shortenUrlKey }, { $inc: { visits: 1 } }); // Stats tracking
  return savedUrl.originalUrl;
}

async function createShortenedUrl(originalUrl, customAlias) {
  if (!isValidUrl(originalUrl)) throw new Error('Invalid URL');

  const existingUrl = await findOne({ originalUrl });
  if (existingUrl) return existingUrl.shortenUrlKey;

  let shortenUrlKey = customAlias || (await generateUniqueToken());
  if (customAlias) {
    const aliasExists = await findOne({ shortenUrlKey: customAlias });
    if (aliasExists) throw new Error('Custom alias already taken');
  }

  const newUrl = await create({ originalUrl, shortenUrlKey });
  await set(newUrl.shortenUrlKey, newUrl.originalUrl, 'EX', ONE_MINUTE_IN_SECONDS);
  return newUrl.shortenUrlKey;
}

module.exports = { getAllUrls, getUrlByShortenUrlKey, createShortenedUrl };