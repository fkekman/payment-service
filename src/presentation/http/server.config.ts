const _port = process.env.PORT;
const _webhook_secret = process.env.WEBHOOK_SECRET;

if (!_port) {
  throw new Error('PORT is not defined');
}

if (!_webhook_secret) {
  throw new Error('WEBHOOK_SECRET is not defined');
}

export const PORT = _port;
export const WEBHOOK_SECRET = _webhook_secret;
