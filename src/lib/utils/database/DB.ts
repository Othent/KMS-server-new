import { mongo_client } from "./mongoClient";

async function getSubsCollection() {
  const mongoClient = await mongo_client();
  await mongoClient.connect();
  return mongoClient.db().collection("KMS_lastNonces");
}

export async function updateJWTNonce(sub: string, nonce: number) {
  const mongoClient = await mongo_client();
  const collection = await getSubsCollection();

  const doc = await collection.findOne({ "subs.name": sub });

  if (doc) {
    await collection.updateOne(
      { _id: doc._id, "subs.name": sub },
      { $set: { "subs.$.lastNonce": nonce } },
    );
    await mongoClient.close();
    return nonce;
  } else {
    await collection.updateOne(
      {},
      { $addToSet: { subs: { name: sub, lastNonce: nonce } } },
      { upsert: true },
    );
    await mongoClient.close();
    return nonce;
  }
}

export async function getLastNonce(sub: string) {
  const mongoClient = await mongo_client();
  const collection = await getSubsCollection();
  const document = await collection.findOne({ "subs.name": sub });
  await mongoClient.close();

  // @ts-ignore
  const subObject = document?.subs.find((s) => s.name === sub);
  if (subObject && subObject.lastNonce) {
    return subObject.lastNonce;
  } else {
    await updateJWTNonce(sub, 1);
    return 1;
  }
}
