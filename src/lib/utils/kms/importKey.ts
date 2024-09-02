// import { kmsClient } from "./kmsClient.js";
// import jwkToPem from "jwk-to-pem";
// import { generateKey } from "../arweave/generateKey.js";
// import { ownerToAddress } from "../arweave/arweaveUtils.js";

import { changeId } from "../tools/changeId";
import { kmsClient, PROJECT_LOCATION, PROJECT_NAME } from "./kmsClient";

// //   async function prepareKeyForImport(JWK) {

// //     const stringJWK = JSON.stringify(JWK)
// //     const bufferStuff = Buffer.from(stringJWK, 'utf-8')

// //     const encryptedKey = crypto.publicEncrypt({
// //       key: heloop,
// //       padding: constants.RSA_PKCS1_OAEP_PADDING,
// //       oaepHash: 'sha256',
// //   }, bufferStuff);

// //     return bufferStuff;
// //   }

// export default async function importKey(): Promise<any> {
//   await createImportJob("Job3");

//   const { mnemonic, JWK } = await generateKey();

//   delete JWK.d;
//   delete JWK.p;
//   delete JWK.q;
//   delete JWK.dp;
//   delete JWK.dq;
//   delete JWK.qi;

//   // const processedKey = await prepareKeyForImport(JWK)

//   // const res = await importTheKey('Job3', 'Key', processedKey)

//   const walletAddress = await ownerToAddress(JWK.n);

//   return { mnemonic, walletAddress };
// }

export async function fetchKMSImportJob(sub: string) {
  const safeId = changeId(sub);

  const importJobName = kmsClient.importJobPath(
    PROJECT_NAME,
    PROJECT_LOCATION,
    safeId,
    "importJob",
  );

  const [importJob] = await kmsClient.getImportJob({
    name: importJobName,
  });

  return importJob;
}

export async function importKMSKeys(
  sub: string,
  wrappedSignKey: string | Uint8Array,
  wrappedEncryptDecryptKey: string | Uint8Array,
) {
  const safeId = changeId(sub);

  // const kmsClient = new KeyManagementServiceClient();
  // return await kmsClient.importCryptoKeyVersion({
  //   parent: `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/${cryptoKeyId}`,
  //   algorithm: 'RSA_SIGN_PSS_4096_SHA256',
  //   importJob: `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/importJobs/${importJobId}`,
  //   // wrappedKey: rsaAesWrappedKey
  // });

  const importJobName = kmsClient.importJobPath(
    PROJECT_NAME,
    PROJECT_LOCATION,
    safeId,
    "importJob"
  );

  const signCryptoKeyName = kmsClient.cryptoKeyPath(
    PROJECT_NAME,
    PROJECT_LOCATION,
    safeId,
    "sign"
  );

  const encryptDecryptCryptoKeyName = kmsClient.cryptoKeyPath(
    PROJECT_NAME,
    PROJECT_LOCATION,
    safeId,
    "encryptDecrypt"
  );

  const signKeyImportPromise = kmsClient.importCryptoKeyVersion({
    parent: signCryptoKeyName,
    importJob: importJobName,
    algorithm: 'RSA_SIGN_PSS_4096_SHA256',
    wrappedKey: wrappedSignKey,
  });

  const encryptDecryptKeyImportPromise = kmsClient.importCryptoKeyVersion({
    parent: encryptDecryptCryptoKeyName,
    importJob: importJobName,
    algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION',
    wrappedKey: wrappedEncryptDecryptKey,
  });

  const [
    [signKeyVersion],
    [encryptDecryptVersion]
  ] = await Promise.all([
    signKeyImportPromise,
    encryptDecryptKeyImportPromise,
  ]);

  return {
    signKeyVersion,
    encryptDecryptVersion,
  }
}
