import { KeyManagementServiceClient } from "@google-cloud/kms";
import assert from "assert";
import crypto from "crypto";
import { delay } from "../tools/delay";
import { b64ToUint8Array, binaryDataTypeOrStringTob64String, binaryDataTypeToString, stringToUint8Array } from "../arweave/arweaveUtils";
import { CryptoKeyVersionState } from "./google-kms.types";

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

const ASYMMETRIC_ALGORITHM = "SHA256";
const { privateKey: PRIVATE_KEY, publicKey: PUBLIC_KEY } =
  crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

// The `implements` part is commented out to avoid having to mock that massive class. If you need to add/update the current implementation, you can uncomment
// it while you are working on the changes to get some help from autocompletion, and comment it again once you are done:

export class LocalKeyManagementServiceClient /* implements KeyManagementServiceClient */ {
  constructor() {
    this.testLocalKeyManagementServiceClient();
  }

  async testLocalKeyManagementServiceClient() {
    // Give the server some time to start:
    await delay(1000);

    console.log("✔️  Verifying `LocalKeyManagementServiceClient`...");
    console.log(" ╷ ");

    const originalPlaintext = "Secret message.";
    const originalPlaintextBuffer = b64ToUint8Array(binaryDataTypeOrStringTob64String(originalPlaintext));

    const encryptResponse = await this.encrypt({
      plaintext: originalPlaintext,
    });

    const encryptResponseFromBuffer = await this.encrypt({
      plaintext: originalPlaintextBuffer,
    });

    const { ciphertext } = encryptResponse[0];
    const { ciphertext: ciphertextFromBuffer } = encryptResponseFromBuffer[0];

    console.log(` ├ encrypt("${originalPlaintext}") => ${ciphertext}`);
    console.log(` ├ encrypt("${originalPlaintext}") (b64) => ${ciphertextFromBuffer}`);

    assert.equal(
      ciphertext,
      ciphertextFromBuffer,
      "Encryption doesn't work consistently with UTF-16 and B64.",
    );

    const decryptResponse = await this.decrypt({
      ciphertext,
    });

    // const ciphertextBuffer = stringToUint8Array(ciphertextFromBuffer);

    // const ciphertextBuffer = b64ToUint8Array(binaryDataTypeOrStringTob64String(ciphertextFromBuffer as string));
    // console.log(binaryDataTypeToString(ciphertextBuffer) === ciphertextFromBuffer);

    // const decryptResponseFromBuffer = await this.decrypt({
    //   ciphertext: ciphertextBuffer,
    // });

    // const decryptResponseFromBuffer = [{ plaintext: originalPlaintext }];

    const { plaintext } = decryptResponse[0];
    // const { plaintext: plaintextFromBuffer } = decryptResponseFromBuffer[0];

    console.log(` ├ decrypt("${ciphertext}") => ${plaintext}`);
    // console.log(` ├ decrypt("${ciphertext}") (b64) => ${plaintextFromBuffer}`);
    console.log(` ├ decrypt("${ciphertext}") (b64) => NOT IMPLEMENTED`);

    // assert.equal(
    //   plaintext,
    //   plaintextFromBuffer,
    //   "Decryption doesn't work consistently with UTF-16 and B64.",
    // );

    assert.equal(
      originalPlaintext,
      plaintext,
      "Decrypted message doesn't match the original input.",
    );

    const asymmetricSignResponse = await this.asymmetricSign({
      data: originalPlaintext,
    });

    const asymmetricSignResponseFromBuffer = await this.asymmetricSign({
      data: originalPlaintextBuffer,
    });

    const { signature } = asymmetricSignResponse[0];
    const { signature: signatureFromBuffer } = asymmetricSignResponseFromBuffer[0];

    if (typeof signature !== 'string' || typeof signatureFromBuffer !== 'string') {
      throw new Error("Not implemented.");
    }

    console.log(` ├ asymmetricSign("${originalPlaintext}") => ${signature.slice(0, 32)}...`);
    console.log(` ├ asymmetricSign("${originalPlaintext}") (b64) => ${signatureFromBuffer.slice(0, 32)}...`);

    assert.equal(
      signature,
      signatureFromBuffer,
      "Signature doesn't work consistently with UTF-16 and B64.",
    );

    const publicKeyResponse = await this.getPublicKey();
    const { pem } = publicKeyResponse[0];
    const publicKey = crypto.createPublicKey(pem || "");

    const isSignatureValid = crypto.verify(
      ASYMMETRIC_ALGORITHM,
      Buffer.from(originalPlaintext),
      publicKey,
      Buffer.from(signature || "", "hex"),
    );

    const isSignatureFromBufferValid = crypto.verify(
      ASYMMETRIC_ALGORITHM,
      originalPlaintextBuffer,
      publicKey,
      Buffer.from(signatureFromBuffer || "", "hex"),
    );

    console.log(` ├ isSignatureValid = ${isSignatureValid}`);
    console.log(` └ isSignatureValid (b64) = ${isSignatureFromBufferValid}`);

    assert(isSignatureValid, "Invalid signature.");
    assert(isSignatureFromBufferValid, "Invalid signature from buffer.");

    console.log("");
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
        state: "ACTIVE"
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
        state: "ACTIVE"
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

    // const plaintextBuffer = typeof request.plaintext === 'string'
    //   ? Buffer.from(request.plaintext || "")
    //   : request.plaintext;

    let ciphertextBuffer = cipher.update(request.plaintext);

    ciphertextBuffer = Buffer.concat([ciphertextBuffer, cipher.final()]);

    const ciphertext = ciphertextBuffer.toString("hex");

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

    const ciphertextBuffer = typeof request.ciphertext === 'string'
      ? Buffer.from(request.ciphertext, "hex")
      : request.ciphertext;
    //   : stringToUint8Array(binaryDataTypeToString(request.ciphertext.buffer));

    let plaintextBuffer = decipher.update(ciphertextBuffer);

    plaintextBuffer = Buffer.concat([plaintextBuffer, decipher.final()]);

    const plaintext = plaintextBuffer.toString();

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
      ? Buffer.from(request.data || "")
      : request.data;

    const signatureBuffer = crypto.sign(
      ASYMMETRIC_ALGORITHM,
      dataBuffer,
      PRIVATE_KEY,
    );

    const signature = signatureBuffer.toString("hex");

    return Promise.resolve([
      {
        signature,
      } satisfies IAsymmetricSignResponse,
      request,
      undefined,
    ]);
  }
}
