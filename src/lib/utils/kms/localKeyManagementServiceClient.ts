import assert from "assert";
import crypto from "crypto";
import { binaryDataTypeToString, uint8ArrayTob64 } from "../arweave/arweaveUtils";
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

// The `implements` part is commented out to avoid having to mock that massive class. If you need to add/update the current implementation, you can uncomment
// it while you are working on the changes to get some help from autocompletion, and comment it again once you are done:

export class LocalKeyManagementServiceClient /* implements KeyManagementServiceClient */ {

  // Private symmetric encryption/decryption key:
  static SYMMETRIC_ALGORITHM = "aes-256-cbc";
  static KEY_BUFFER = crypto.randomBytes(32);
  static IV_BUFFER = crypto.randomBytes(16);

  // Private and public asymmetric signing (and potentially encryption/decryption) keys:
  static ASYMMETRIC_ALGORITHM = "SHA256";
  static RSA_KEY_PAIR = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  static PRIVATE_KEY = LocalKeyManagementServiceClient.RSA_KEY_PAIR.privateKey;
  static PUBLIC_KEY = LocalKeyManagementServiceClient.RSA_KEY_PAIR.publicKey;

  // Wrapping keys for the import keys PoC:
  static IMPORT_JOB_PEM = crypto.generateKeyPairSync("rsa", {
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

  static hashDataToSign(data: NodeJS.ArrayBufferView) {
    return crypto.hash(
      "SHA-256",
      data,
      "base64"
    );
  }

  static async verifySignature(
    data: NodeJS.ArrayBufferView,
    signature: NodeJS.ArrayBufferView,
  ) {
    const originalPlainTextHash = await LocalKeyManagementServiceClient.hashDataToSign(data);
    const originalPlainTextHashBuffer = Buffer.from(originalPlainTextHash, "base64");

    return crypto.verify(
      LocalKeyManagementServiceClient.ASYMMETRIC_ALGORITHM,
      originalPlainTextHashBuffer,
      LocalKeyManagementServiceClient.PUBLIC_KEY,
      signature,
    );
  }


  async testLocalKeyManagementServiceClient() {
    console.log("✔️  Verifying `LocalKeyManagementServiceClient`...");
    console.log(" ╷ ");

    // ENCRYPT:

    const originalPlaintext = "Secret message.";
    const originalPlaintextBuffer = Buffer.from(originalPlaintext);
    const encryptResponse = await this.encrypt({
      plaintext: originalPlaintextBuffer,
    });

    const { ciphertext } = encryptResponse[0];
    const ciphertextB64String = !ciphertext || typeof ciphertext === "string"
      ? (ciphertext || "")
      : uint8ArrayTob64(ciphertext);

    console.log(` ├ encrypt("${originalPlaintext}") => ${ciphertextB64String}`);

    // DECRYPT:

    const decryptResponse = await this.decrypt({
      ciphertext,
    });

    const { plaintext } = decryptResponse[0];
    const plaintextB64String = !plaintext || typeof plaintext === "string"
      ? (plaintext || "")
      : uint8ArrayTob64(plaintext);
    const plaintextString = !plaintext || typeof plaintext === "string"
      ? (plaintext || "")
      : binaryDataTypeToString(plaintext);

    console.log(` ├ decrypt("${ciphertextB64String}") => ${ plaintextB64String } => ${ plaintextString }`);

    assert.equal(
      originalPlaintext,
      plaintextString,
      "Decrypted message doesn't match the original input.",
    );

    const originalPlaintextHash = await LocalKeyManagementServiceClient.hashDataToSign(originalPlaintextBuffer);
    const originalPlaintextHashBuffer = Buffer.from(originalPlaintextHash, "base64");

    const asymmetricSignResponse = await this.asymmetricSign({
      data: originalPlaintextHashBuffer,
    });

    const { signature } = asymmetricSignResponse[0];
    const signatureB64String = !signature || typeof signature === "string"
      ? (signature || "")
      : uint8ArrayTob64(signature);

    console.log(` ├ asymmetricSign("${originalPlaintextHash}") => ${signatureB64String.slice(0, 32)}...`);

    assert(!!signature && typeof signature !== "string", "Invalid signature type.");

    const isSignatureValid = await LocalKeyManagementServiceClient.verifySignature(originalPlaintextBuffer, signature);

    console.log(` ├ isSignatureValid = ${isSignatureValid}`);

    assert(isSignatureValid === true, "Invalid signature.");

    const publicKeyResponse = await this.getPublicKey();
    const { pem } = publicKeyResponse[0];

    console.log(` └ publicKey =\n\n${pem}`)
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
          pem: LocalKeyManagementServiceClient.IMPORT_JOB_PEM,
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
          pem: LocalKeyManagementServiceClient.IMPORT_JOB_PEM,
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

    if (typeof request.plaintext === "string") {
      throw new Error("`plaintext` must be a binary type, plain `string` not accepted accepted.");
    }

    const cipher = crypto.createCipheriv(
      LocalKeyManagementServiceClient.SYMMETRIC_ALGORITHM,
      LocalKeyManagementServiceClient.KEY_BUFFER,
      LocalKeyManagementServiceClient.IV_BUFFER,
    );

    const plaintextBuffer = typeof request.plaintext === 'string'
      ? Buffer.from(request.plaintext || "", "base64")
      : request.plaintext;

    let ciphertextBuffer = cipher.update(plaintextBuffer);

    ciphertextBuffer = Buffer.concat([ciphertextBuffer, cipher.final()]);

    // Only needed for debugging:
    // const ciphertext = ciphertextBuffer.toString("base64");

    return Promise.resolve([
      {
        ciphertext: ciphertextBuffer,
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

    if (typeof request.ciphertext === "string") {
      throw new Error("`ciphertext` must be a binary type, plain `string` not accepted accepted.");
    }

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      LocalKeyManagementServiceClient.KEY_BUFFER,
      LocalKeyManagementServiceClient.IV_BUFFER,
    );

    const ciphertextBuffer = typeof request.ciphertext === 'string'
      ? Buffer.from(request.ciphertext || "", "base64")
      : request.ciphertext;

    let plaintextBuffer = decipher.update(ciphertextBuffer);

    plaintextBuffer = Buffer.concat([plaintextBuffer, decipher.final()]);

    // Only needed for debugging:
    // const plaintext = plaintextBuffer.toString("base64");

    return Promise.resolve([
      {
        plaintext: plaintextBuffer,
      } satisfies IDecryptResponse,
      request,
      undefined,
    ]);
  }

  getPublicKey(
    request?: IGetPublicKeyRequest,
  ): Promise<[IPublicKey, IGetPublicKeyRequest | undefined, {} | undefined]> {
    const publicKeyDer = LocalKeyManagementServiceClient.PUBLIC_KEY.export({
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

    if (typeof request.data === "string") {
      throw new Error("`data` must be a binary type, plain `string` not accepted accepted.");
    }

    const dataBuffer = typeof request.data === 'string'
      ? Buffer.from(request.data || "", "base64")
      : request.data;

    const signatureBuffer = crypto.sign(
      LocalKeyManagementServiceClient.ASYMMETRIC_ALGORITHM,
      dataBuffer,
      LocalKeyManagementServiceClient.PRIVATE_KEY,
    );

    // Only needed for debugging:
    // const signature = signatureBuffer.toString("base64");

    return Promise.resolve([
      {
        signature: signatureBuffer,
      } satisfies IAsymmetricSignResponse,
      request,
      undefined,
    ]);
  }
}
