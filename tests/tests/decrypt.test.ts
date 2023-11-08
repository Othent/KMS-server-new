import decrypt from "../../src/lib/decrypt";
import encrypt from "../../src/lib/encrypt";
import { decryptedData, keyName } from "../testValues";

test("if decrypt() works", async () => {
  const callEncrypted = await encrypt(decryptedData, keyName);
  const callDecrypted = await decrypt(callEncrypted.data, keyName);

  expect(callDecrypted).toEqual({ data: decryptedData });
});
