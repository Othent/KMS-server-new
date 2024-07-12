import { MongoClient } from "mongodb";
import { CONFIG } from "../../server/config/config.utils";

export async function getMongoClient() {
  return new MongoClient(
    `mongodb://${ CONFIG.MONGODB_USERNAME }:${encodeURIComponent(
      CONFIG.MONGODB_PASSWORD ,
    )}@${ CONFIG.MONGODB_HOST }/${ CONFIG.MONGODB_DB_NAME}`,
  );
}
