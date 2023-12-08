import { MongoClient } from "mongodb";

export async function mongo_client() {
  if (
    !process.env.mongoDBUsername ||
    !process.env.mongoDBPassword ||
    !process.env.mongoDBHost ||
    !process.env.mongoDBName
  ) {
    console.log(
      "Please specify a mongoDBUsername/mongoDBPassword/mongoDBHost/mongoDBName file in the .env",
    );
    throw new Error(
      "Please specify a mongoDBUsername/mongoDBPassword/mongoDBHost/mongoDBName file in the .env",
    );
  }

  return new MongoClient(
    `mongodb://${process.env.mongoDBUsername}:${encodeURIComponent(
      process.env.mongoDBPassword,
    )}@${process.env.mongoDBHost}/${process.env.mongoDBName}`,
  );
}
