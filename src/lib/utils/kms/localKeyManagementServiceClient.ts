import assert from "assert";
import crypto from "crypto";
import { delay } from "../tools/delay";
import { B64String, b64ToUint8Array, binaryDataTypeToString, uint8ArrayTob64 } from "../arweave/arweaveUtils";
import { CryptoKeyVersionState } from "./google-kms.utils";
// import { KeyManagementServiceClient } from "@google-cloud/kms";

// KeyRing:

type IKeyRing =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IKeyRing;
type ICreateKeyRingRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICreateKeyRingRequest;
type ICreateCryptoKeyRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICreateCryptoKeyRequest;

// CryptoKey:

type ICryptoKey =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICryptoKey;
type ICryptoKeyVersion =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICryptoKeyVersion;
type IGetCryptoKeyRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IGetCryptoKeyRequest;
type IGetCryptoKeyVersionRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IGetCryptoKeyVersionRequest;
type IImportCryptoKeyVersionRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IImportCryptoKeyVersionRequest;
type IUpdateCryptoKeyPrimaryVersionRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IUpdateCryptoKeyPrimaryVersionRequest;

  // Import:

type IImportJob =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IImportJob;
type IGetImportJobRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IGetImportJobRequest;
type ICreateImportJobRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICreateImportJobRequest;

// Encrypt:

type IEncryptRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IEncryptRequest;
type IEncryptResponse =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IEncryptResponse;

// Decrypt:

type IDecryptRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IDecryptRequest;
type IDecryptResponse =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IDecryptResponse;

// Public Key:

type IPublicKey =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IPublicKey;
type IGetPublicKeyRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IGetPublicKeyRequest;

// Sign:

type IAsymmetricSignRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IAsymmetricSignRequest;
type IAsymmetricSignResponse =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IAsymmetricSignResponse;

const SYMMETRIC_ALGORITHM = "aes-256-cbc";
const KEY_BUFFER = crypto.randomBytes(32);
const IV_BUFFER = crypto.randomBytes(16);

// TODO: Add an endpoint to return these to the frontend to use the mocked KMS for signing and verifying too:
const ASYMMETRIC_ALGORITHM = "SHA256";
const { privateKey: PRIVATE_KEY, publicKey: PUBLIC_KEY } =
  crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

const IMPORT_JOB_PEM = crypto.generateKeyPairSync("rsa", {
  modulusLength: 3072,
  // publicExponent: new Uint8Array([1,0,1]),
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'top secret'
  }
}).publicKey;

// The `implements` part is commented out to avoid having to mock that massive class. If you need to add/update the current implementation, you can uncomment
// it while you are working on the changes to get some help from autocompletion, and comment it again once you are done:

export class LocalKeyManagementServiceClient /* implements KeyManagementServiceClient */ {

  private isEnabled = false;

  async testLocalKeyManagementServiceClient() {
    // Give the server some time to start:
    await delay(1000);

    console.log("✔️  Verifying `LocalKeyManagementServiceClient`...");
    console.log(" ╷ ");

    // ENCRYPT:

    const originalPlaintext = "Secret message.";
    const originalPlaintextBuffer = Buffer.from(originalPlaintext);
    const encryptResponse = await this.encrypt({
      plaintext: originalPlaintextBuffer,
    });

    const { ciphertext } = encryptResponse[0];

    console.log(` ├ encrypt("${originalPlaintext}") => ${ciphertext}`);

    // DECRYPT:

    const decryptResponse = await this.decrypt({
      ciphertext,
    });

    const { plaintext } = decryptResponse[0];
    const plaintextString = binaryDataTypeToString(b64ToUint8Array(plaintext as any));

    console.log(` ├ decrypt("${ciphertext}") => ${plaintext} (${ plaintextString })`);

    assert.equal(
      originalPlaintext,
      plaintextString,
      "Decrypted message doesn't match the original input.",
    );

    const originalPlainTextHash = await crypto.hash(
      "SHA-256",
      originalPlaintextBuffer,
      "base64"
    );

    const originalPlainTextHashBuffer = Buffer.from(originalPlainTextHash, "base64");

    const asymmetricSignResponse = await this.asymmetricSign({
      data: originalPlainTextHashBuffer,
    });

    const { signature } = asymmetricSignResponse[0];

    console.log(` ├ asymmetricSign("${originalPlainTextHash}") => ${(signature as string).slice(0, 32)}...`);

    const publicKeyResponse = await this.getPublicKey();
    const { pem } = publicKeyResponse[0];
    const publicKey = crypto.createPublicKey(pem || "");

    console.log({
      plaintext: originalPlaintext,
      plaintextHash: originalPlainTextHash,
      plaintextHashBuffer: originalPlainTextHashBuffer,
      publicKey,
      signature,
    })

    const isSignatureValid = crypto.verify(
      ASYMMETRIC_ALGORITHM,
      originalPlainTextHashBuffer,
      publicKey,
      b64ToUint8Array(signature as B64String),
    );

    console.log(` ├ isSignatureValid = ${isSignatureValid}`);

    assert(isSignatureValid, "Invalid signature.");

    console.log(` └ publicKey =\n\n${pem}`)
    console.log("");

    this.isEnabled = true;
  }

  locationPath(...args: string[]) {
    return args.join("#");
  }

  keyRingPath(...args: string[]) {
    return args.join("#");
  }

  cryptoKeyPath(...args: string[]) {
    return args.join("#");
  }

  cryptoKeyVersionPath(...args: string[]) {
    return args.join("#");
  }

  importJobPath(...args: string[]) {
    return args.join("#");
  }

  createKeyRing(
    request?: ICreateKeyRingRequest,
  ): Promise<[IKeyRing, ICreateKeyRingRequest | undefined, {} | undefined]> {
    if (request?.keyRing)
      return Promise.resolve([request.keyRing, request, undefined]);

    return Promise.resolve([
      {
        name: `${request?.parent || "<PARENT>"}#${request?.keyRingId || "<KEY_RING_ID>"}`,
        createTime: null,
      } satisfies IKeyRing,
      request,
      undefined,
    ]);
  }

  createCryptoKey(
    request?: ICreateCryptoKeyRequest,
  ): Promise<
    [ICryptoKey, ICreateCryptoKeyRequest | undefined, {} | undefined]
  > {
    if (request?.cryptoKey)
      return Promise.resolve([request.cryptoKey, request, undefined]);

    return Promise.resolve([
      {
        name: `${request?.parent || "<PARENT>"}#${request?.cryptoKeyId || "<CRYPTO_KEY_ID>"}`,
        createTime: null,
      } satisfies ICryptoKey,
      request,
      undefined,
    ]);
  }

  getCryptoKey(
    request?: IGetCryptoKeyRequest
  ): Promise<[ICryptoKey, IGetCryptoKeyRequest | undefined, {} | undefined]> {
    return Promise.resolve([
      {
        name: request?.name,
        createTime: null,
        primary: {
          name: "<PRIMARY>",
          state: CryptoKeyVersionState.CRYPTO_KEY_VERSION_STATE_UNSPECIFIED,
        },
      } satisfies ICryptoKey,
      request,
      undefined,
    ]);
  }

  getCryptoKeyVersion(
    request?: IGetCryptoKeyVersionRequest
  ): Promise<[ICryptoKeyVersion, IGetCryptoKeyVersionRequest | undefined, {} | undefined]> {
    return Promise.resolve([
      {
        name: request?.name || "<CRYPTO_KEY_VERSION>",
        createTime: null,
        state: CryptoKeyVersionState.CRYPTO_KEY_VERSION_STATE_UNSPECIFIED,
      } satisfies ICryptoKeyVersion,
      request,
      undefined,
    ]);
  }

  updateCryptoKeyPrimaryVersion(
    request?: IUpdateCryptoKeyPrimaryVersionRequest
  ): Promise<[ICryptoKey, IUpdateCryptoKeyPrimaryVersionRequest | undefined, {} | undefined]> {
    return Promise.resolve([
      {
        name: request?.name || "<CRYPTO_KEY_VERSION>",
        createTime: null,
        primary: {
          name: "<PRIMARY>",
          state: CryptoKeyVersionState.CRYPTO_KEY_VERSION_STATE_UNSPECIFIED,
        },
      } satisfies ICryptoKey,
      request,
      undefined,
    ]);
  }

  createImportJob(
    request?: ICreateImportJobRequest
  ): Promise<[IImportJob, ICreateImportJobRequest | undefined, {} | undefined]> {
    return Promise.resolve([
      {
        state: "ACTIVE",
        publicKey: {
          pem: IMPORT_JOB_PEM,
        },
      } satisfies IImportJob,
      request,
      undefined,
    ]);
  }

  getImportJob(
    request?: IImportJob
  ): Promise<[IImportJob, IGetImportJobRequest | undefined, {} | undefined]> {
    return Promise.resolve([
      {
        state: "ACTIVE",
        publicKey: {
          pem: IMPORT_JOB_PEM,
        },
      } satisfies IImportJob,
      request,
      undefined,
    ]);
  }

  importCryptoKeyVersion(
    request?: IImportCryptoKeyVersionRequest
  ): Promise<[ICryptoKeyVersion, IImportCryptoKeyVersionRequest | undefined, {} | undefined]> {
    return Promise.resolve([
      {
        name: "<CRYPTO_KEY_VERSION>",
        createTime: null,
        state: CryptoKeyVersionState.CRYPTO_KEY_VERSION_STATE_UNSPECIFIED,
      } satisfies ICryptoKeyVersion,
      request,
      undefined,
    ]);
  }

  encrypt(
    request?: IEncryptRequest,
  ): Promise<[IEncryptResponse, IEncryptRequest | undefined, {} | undefined]> {
    if (!request || !request.plaintext) {
      throw new Error("Not plaintext.");
    }

    const cipher = crypto.createCipheriv(
      SYMMETRIC_ALGORITHM,
      KEY_BUFFER,
      IV_BUFFER,
    );

    if (this.isEnabled && typeof request.plaintext === 'string') {
      throw new Error(`Mocked encrypt() doesn't support string plaintext.`);
    }

    const plaintextBuffer = typeof request.plaintext === 'string'
      ? Buffer.from(request.plaintext || "", "base64")
      : request.plaintext;

    let ciphertextBuffer = cipher.update(plaintextBuffer);

    ciphertextBuffer = Buffer.concat([ciphertextBuffer, cipher.final()]);

    const ciphertext = ciphertextBuffer.toString("base64");
    // const ciphertext2 = uint8ArrayTob64(ciphertextBuffer);

    console.log({
      fn: "ENCRYPT",
      original: binaryDataTypeToString(plaintextBuffer),
      ciphertext,
      // ciphertext2,
      ciphertextBuffer: new Uint8Array(ciphertextBuffer).buffer,
    })

    // console.log("BUFFER =", ciphertextBuffer);

    // console.log(stringOrUint8ArrayToUint8Array(ciphertext))

    return Promise.resolve([
      {
        ciphertext,
      } satisfies IEncryptResponse,
      request,
      undefined,
    ]);
  }

  decrypt(
    request?: IDecryptRequest,
  ): Promise<[IDecryptResponse, IDecryptRequest | undefined, {} | undefined]> {
    if (!request || !request.ciphertext) {
      throw new Error("Not ciphertext.");
    }

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      KEY_BUFFER,
      IV_BUFFER,
    );

    if (this.isEnabled && typeof request.ciphertext === 'string') {
      throw new Error(`Mocked decrypt() doesn't support string ciphertext.`);
    }

    // TODO: If string throw not implemented...

    const ciphertextBuffer = typeof request.ciphertext === 'string'
      ? Buffer.from(request.ciphertext, "base64")
      // ? b64ToUint8Array(request.ciphertext as B64String)
      : request.ciphertext;
    //   : stringToUint8Array(binaryDataTypeToString(request.ciphertext.buffer));

    let plaintextBuffer = decipher.update(ciphertextBuffer);

    plaintextBuffer = Buffer.concat([plaintextBuffer, decipher.final()]);

    const plaintext = plaintextBuffer.toString("base64");
    // const plaintext2 = uint8ArrayTob64(plaintextBuffer);

    console.log({
      fn: "DECRYPT",
      encrypted: uint8ArrayTob64(ciphertextBuffer),
      encryptedBuffer: ciphertextBuffer,
      plaintext,
      plaintextString: plaintextBuffer.toString(),
    })

    return Promise.resolve([
      {
        plaintext,
      } satisfies IDecryptResponse,
      request,
      undefined,
    ]);
  }

  getPublicKey(
    request?: IGetPublicKeyRequest,
  ): Promise<[IPublicKey, IGetPublicKeyRequest | undefined, {} | undefined]> {
    const publicKeyDer = PUBLIC_KEY.export({
      type: "spki",
      // TODO: This can be exported directly as `format: "pem"`
      format: "der",
    }).toString("base64");
    const formattedPublicKey = publicKeyDer.replace(/.{64}/g, "$&\n");
    const pem = `-----BEGIN PUBLIC KEY-----\n${formattedPublicKey}\n-----END PUBLIC KEY-----\n`;

    return Promise.resolve([
      {
        pem,
      } satisfies IPublicKey,
      request,
      undefined,
    ]);
  }

  asymmetricSign(
    request?: IAsymmetricSignRequest,
  ): Promise<
    [
      IAsymmetricSignResponse,
      IAsymmetricSignRequest | undefined,
      {} | undefined,
    ]
  > {
    if (!request || !request.data) {
      throw new Error("Not data.");
    }

    const dataBuffer = typeof request.data === 'string'
      ? Buffer.from(request.data || "", "base64")
      : request.data;

    const signatureBuffer = crypto.sign(
      ASYMMETRIC_ALGORITHM,
      dataBuffer,
      PRIVATE_KEY,
    );

    const signature = signatureBuffer.toString("base64");

    console.log({
      signature
    });

    return Promise.resolve([
      {
        signature,
      } satisfies IAsymmetricSignResponse,
      request,
      undefined,
    ]);
  }
}
