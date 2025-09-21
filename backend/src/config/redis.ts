import { logger } from './logger';

// Mock Redis client for development without Redis server
const redis = {
  connect: async () => {
    logger.info('Redis Client (Mock) Connected');
    return Promise.resolve();
  },
  disconnect: async () => {
    logger.info('Redis Client (Mock) Disconnected');
    return Promise.resolve();
  },
  setEx: async (key: string, seconds: number, value: string) => {
    logger.debug(`Redis Mock setEx: ${key} = ${value} (${seconds}s)`);
    return Promise.resolve('OK');
  },
  get: async (key: string) => {
    logger.debug(`Redis Mock get: ${key}`);
    return Promise.resolve(null);
  },
  del: async (key: string) => {
    logger.debug(`Redis Mock del: ${key}`);
    return Promise.resolve(1);
  },
  on: (event: string, callback: Function) => {
    // Mock event handlers
  }
};

export default redis;