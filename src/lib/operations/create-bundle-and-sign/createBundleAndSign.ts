import { sign } from "../sign/sign";
import { createData, DataItem, Signer } from "arbundles";
import base64url from "base64url";
import { stringToBuffer } from "../../utils/arweave/arweaveUtils";

export async function createBundleAndSign(
  data: string | Uint8Array,
  keyName: string,
  owner: string,
  // TODO: Remove this any.
  tags: any,
) {
  try {
    const signerSignFn = async (message: Uint8Array) => {
      const signature = await sign(message, keyName);

      if (!signature) throw new Error("Invalid signature data.");

      return stringToBuffer(signature);
    };

    const signer: Signer = {
      publicKey: base64url.toBuffer(owner),
      signatureType: 1,
      signatureLength: 512,
      ownerLength: 512,
      sign: signerSignFn,
      // verify: null,
    };

    let dataEntry = createData(data, signer, { tags });

    try {
      await dataEntry.sign(signer);
    } catch (error) {
      console.log(error);
    }

    // TODO: Missing return type?
    return { dataEntry: { raw: dataEntry.getRaw(), id: dataEntry.id } };
  } catch (e) {
    throw new Error(`Error creating bundling and signing data. ${e}`);
  }
}
