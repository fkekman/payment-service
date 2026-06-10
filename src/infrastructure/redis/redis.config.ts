const _redis_host = process.env.REDIS_HOST;
const _redis_port = process.env.REDIS_PORT;

if (!_redis_host) {
  throw new Error('REDIS_HOST is not defined');
}

if (!_redis_port) {
  throw new Error('REDIS_PORT is not defined');
}

export const REDIS_HOST = _redis_host;
export const REDIS_PORT = _redis_port;

