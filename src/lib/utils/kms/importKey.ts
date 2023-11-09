// import { kmsClient } from "./kmsClient.js";
// import jwkToPem from "jwk-to-pem";
// import { generateKey } from "../arweave/generateKey.js";
// import { ownerToAddress } from "../arweave/arweaveUtils.js";

// const JobPEM = `-----BEGIN PUBLIC KEY-----
// MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA49RpJabPsIkTLApbA7eU
// NMjX5cEH+quOBSy2PjKucsJEdUE7GvFkGy/RSuFurdMcTNwana4CMavcfARH+AC5
// PTTO3+hJ46DoeRyCALpl3y8jBDWiCoBdrPqIbNTXLy6yqF/FwmEzXhwX3/TylPFp
// 7xmtu2IyAndOXEPrMBHhdaAJnTss3jFNgelAQoD+5WOGYzjc40kLwdC7oMAiDZl4
// NNiDtA8N5CKY9icdVjCvF8eF+TyUc65E552xyss7QeucSGaYAhoIs5bn8mfY2gee
// 5v9JtwtWVLFAeHMbsYTeYYu2O6UXe6DSzkatgA9vfvOb90K4udOgQPmep1d+z00l
// nxevhoUBIuDfKGminL2BenQVOEhwV2xQO4n5Zp3JHWuPWm0TPFTjVL+VoTD8TfT3
// NFzc6Ny8li1WZebEJdmlOLX5GQLrL8NgoxNVSMRvqv4EC6BUeCxN5o0P1Bd3kqd0
// mWRB6Oz/Dq57QzseOi0X6wvcI4lMj25dOypL2kL3pOV7y0yOJlUi4s+kVZjY5i1h
// wqVq1NaFvIp779phyewnEZjTO42I+ZgYor09ncoL5f4SA3dG/Uyz+eGUYfhzm6+p
// kIqIQWJNSzoeGw3fbO8SujYtWKHFaLcvpGwG6TMqvB51d3f5acLGsOlmrjinFcrD
// ATkPvTqcglVzb+dOEMLkGFcCAwEAAQ==
// -----END PUBLIC KEY-----
// `;

// async function createImportJob(importJobId: string) {
//   return await kmsClient.createImportJob({
//     parent: "projects/auth-custom-try/locations/global/keyRings/Canada-Dry",
//     importJobId: importJobId,
//     importJob: {
//       importMethod: "RSA_OAEP_4096_SHA1_AES_256",
//       protectionLevel: "SOFTWARE",
//       // publicKey: { pem: PublicPemJWK }
//     },
//   });
// }

// // async function importTheKey(importJobId, cryptoKeyId, rsaAesWrappedKey) {
// //     const kmsClient = new KeyManagementServiceClient();
// //     return await kmsClient.importCryptoKeyVersion({
// //       parent: `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/${cryptoKeyId}`,
// //       algorithm: 'RSA_SIGN_PSS_4096_SHA256',
// //       importJob: `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/importJobs/${importJobId}`,
// //       // wrappedKey: rsaAesWrappedKey
// //     });
// //   }

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
