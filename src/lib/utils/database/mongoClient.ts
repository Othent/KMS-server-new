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

  // TODO: Probably easier to always call connect() from here and use with?
  // See https://stackoverflow.com/questions/39599063/check-if-mongodb-is-connected, https://www.mongodb.com/community/forums/t/i-am-using-pymongo-do-i-have-to-close-a-mongoclient-after-use/213511
  return new MongoClient(
    `mongodb://${process.env.mongoDBUsername}:${encodeURIComponent(
      process.env.mongoDBPassword,
    )}@${process.env.mongoDBHost}/${process.env.mongoDBName}`,
  );
}
