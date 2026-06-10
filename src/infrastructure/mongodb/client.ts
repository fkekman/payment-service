import { MongoClient } from "mongodb";
import { MONGO_DB_URL } from "./mongo.config";

const _client = new MongoClient(MONGO_DB_URL);

await _client.connect();
console.log('Mongo connected successfully');

export const client = _client;
