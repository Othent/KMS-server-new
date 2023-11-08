import encrypt from "../../src/lib/encrypt";
import decrypt from "../../src/lib/decrypt";
import { decryptedData, keyName } from "../testValues";

test("if encrypt() works", async () => {
  const callEncrypted = await encrypt(decryptedData, keyName);
  const callDecrypt = (await decrypt(callEncrypted.data, keyName)).data;

  expect(callDecrypt).toEqual(decryptedData);
});
