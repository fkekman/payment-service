export const _mongo_db_url = process.env.MONGO_DB_URL as string;

if (!_mongo_db_url) {
  throw new Error('MONGO_DB_URL is not defined');
}

export const MONGO_DB_URL = _mongo_db_url;

