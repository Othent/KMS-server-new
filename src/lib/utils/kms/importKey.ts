import { kmsClient } from "./kmsClient";


const projectId = 'import-key-testing'; // test
const locationId = 'global'; // test
const keyRingId = 'test'; // test
const cryptoKeyId = 'matt'; // test
const importJobId = 'importJob9'; // add logic later for import job


const cryptoKeyName = kmsClient.cryptoKeyPath(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId
);
const importJobName = kmsClient.importJobPath(
  projectId,
  locationId,
  keyRingId,
  importJobId
);


// // need for later for import jobs
// export async function createImportJob(importJobId: string) {
//     return await kmsClient.createImportJob({
//       parent: `projects/auth-custom-try/locations/global/keyRings/${process.env.keyRing}`,
//       importJobId: importJobId,
//       importJob: {
//         importMethod: "RSA_OAEP_4096_SHA256",
//         protectionLevel: "SOFTWARE",
//       },
//     });
//   }
  


export async function importKey(userName: string, importedKey: any) {

  // need to create key / import job with key name userName


  const [version] = await kmsClient.importCryptoKeyVersion({
    parent: cryptoKeyName,
    importJob: importJobName,
    algorithm: 'RSA_SIGN_PSS_4096_SHA256',
    wrappedKey: importedKey,
  });

  return version

}