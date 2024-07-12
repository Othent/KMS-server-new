import { KeyManagementServiceClient } from "@google-cloud/kms";
import assert from "assert";
import crypto from "crypto";
import { delay } from "../tools/delay";

type IKeyRing =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IKeyRing;
type ICreateKeyRingRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICreateKeyRingRequest;
type ICryptoKey =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICryptoKey;
type ICreateCryptoKeyRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.ICreateCryptoKeyRequest;
type IEncryptRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IEncryptRequest;
type IEncryptResponse =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IEncryptResponse;
type IDecryptRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IDecryptRequest;
type IDecryptResponse =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IDecryptResponse;
type IPublicKey =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IPublicKey;
type IGetPublicKeyRequest =
  import("@google-cloud/kms/build/protos/protos").google.cloud.kms.v1.IGetPublicKeyRequest;
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

    const encryptResponse = await this.encrypt({
      plaintext: originalPlaintext,
    });

    const { ciphertext } = encryptResponse[0];

    console.log(` ├ encrypt("${originalPlaintext}") => ${ciphertext}`);

    const decryptResponse = await this.decrypt({
      ciphertext,
    });

    const { plaintext } = decryptResponse[0];

    console.log(` ├ decrypt("${ciphertext}") => ${plaintext}`);

    assert.equal(
      originalPlaintext,
      plaintext,
      "Decrypted message doesn't match the original input.",
    );

    const asymmetricSignResponse = await this.asymmetricSign({
      data: originalPlaintext,
    });

    const { signature } = asymmetricSignResponse[0];

    console.log(
      ` ├ asymmetricSign("${originalPlaintext}") => ${typeof signature}`,
    );

    const publicKeyResponse = await this.getPublicKey();
    const { pem } = publicKeyResponse[0];
    const publicKey = crypto.createPublicKey(pem || "");

    if (ArrayBuffer.isView(signature)) {
      throw new Error("Not implemented.");
    }

    const isSignatureValid = crypto.verify(
      ASYMMETRIC_ALGORITHM,
      Buffer.from(originalPlaintext),
      publicKey,
      Buffer.from(signature || "", "hex"),
    );

    console.log(` └ isSignatureValid = ${isSignatureValid}`);

    assert(isSignatureValid, "Invalid signature.");

    console.log("");
  }

  cryptoKeyPath(...args: string[]) {
    return args.join("#");
  }

  cryptoKeyVersionPath(...args: string[]) {
    return args.join("#");
  }

  locationPath(...args: string[]) {
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

  encrypt(
    request?: IEncryptRequest,
  ): Promise<[IEncryptResponse, IEncryptRequest | undefined, {} | undefined]> {
    const cipher = crypto.createCipheriv(
      SYMMETRIC_ALGORITHM,
      KEY_BUFFER,
      IV_BUFFER,
    );

    let ciphertextBuffer = cipher.update(request?.plaintext || "");

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
    if (ArrayBuffer.isView(request?.ciphertext)) {
      throw new Error("Not implemented.");
    }

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      KEY_BUFFER,
      IV_BUFFER,
    );

    const encryptedText = Buffer.from(request?.ciphertext || "", "hex");

    let decryptedBuffer = decipher.update(encryptedText);

    decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()]);

    const plaintext = decryptedBuffer.toString();

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
    if (ArrayBuffer.isView(request?.data)) {
      throw new Error("Not implemented.");
    }

    const signatureBuffer = crypto.sign(
      ASYMMETRIC_ALGORITHM,
      Buffer.from(request?.data || ""),
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
