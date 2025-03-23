const ZooKeeper = require('zookeeper');
const { generateBase64Token } = require('../utils');

const { ZOOKEEPER_HOST, ZOOKEEPER_DOCKER_PORT } = process.env;
const host = `${ZOOKEEPER_HOST}:${ZOOKEEPER_DOCKER_PORT}`;

let client;
const TOKENS_NODE_PATH = '/tokens';
const MAX_RETRIES = 3;
const MAX_TOKEN_SIZE = 6;

function getZookeeperClient() {
  if (!client) {
    client = new ZooKeeper({
      connect: host,
      timeout: 5000,
      debug_level: ZooKeeper.constants.ZOO_LOG_LEVEL_WARN,
      host_order_deterministic: false,
    });
  }
  return client;
}

async function connectToZookeeper() {
  const client = getZookeeperClient();
  return new Promise((resolve, reject) => {
    client.connect(client.config, async (error) => {
      if (error) {
        console.error('Error connecting to ZooKeeper:', error);
        reject();
      }
      console.log('Successfully connected to ZooKeeper');
      await createTokensNode();
      resolve();
    });
  });
}

async function createTokensNode() {
  const client = getZookeeperClient();
  const doesTokensNodeExist = await client.pathExists(TOKENS_NODE_PATH, false);
  if (doesTokensNodeExist) {
    console.info(`Tokens node ${TOKENS_NODE_PATH} already exists`);
    return;
  }
  await new Promise((resolve, reject) => {
    client.mkdirp(TOKENS_NODE_PATH, (error) => {
      if (error) {
        console.error(`Failed to create tokens node: ${error}`);
        reject();
      }
      console.info(`Tokens node ${TOKENS_NODE_PATH} created`);
      resolve();
    });
  });
}

async function createNode(path, data) {
  try {
    await getZookeeperClient().create(path, data, ZooKeeper.constants.ZOO_EPHEMERAL);
    console.info(`Node ${path} created`);
  } catch (error) {
    console.error(`Failed to create node: ${error}`);
    throw error;
  }
}

async function generateUniqueToken(retryCount = 0) {
  const client = getZookeeperClient();
  const token = generateBase64Token(MAX_TOKEN_SIZE);
  const uniqueTokenPath = `${TOKENS_NODE_PATH}/${token}`;

  try {
    const doesUniqueTokenNodeExist = await client.pathExists(uniqueTokenPath, false);
    if (doesUniqueTokenNodeExist) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Token collision detected for ${uniqueTokenPath}. Retrying...`);
        return await generateUniqueToken(retryCount + 1);
      } else {
        throw new Error(`Failed to generate unique token after ${MAX_RETRIES} attempts`);
      }
    }
    await createNode(uniqueTokenPath, Buffer.from(token));
    return token;
  } catch (error) {
    console.error(`Error generating unique token: ${error}`);
    throw error;
  }
}

module.exports = { connectToZookeeper, generateUniqueToken };