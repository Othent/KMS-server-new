import { sign } from "../sign/sign";
import { createData, Signer, Tag } from "arbundles";
import base64url from "base64url";
import { stringToBuffer } from "../../utils/arweave/arweaveUtils";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";

export async function createBundleAndSign(
  data: string | Uint8Array,
  keyName: string,
  owner: string,
  tags: Tag[],
) {
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
    // Note we don't provide `verify` as it's not used anyway:
    // verify: null,
  };

  const dataItem = createData(data, signer, { tags });

  try {
    // DataItem.sign() sets the DataItem's `id` property and returns its `rawId`:
    await dataItem.sign(signer);
  } catch (err) {
    throw new OthentError(
      OthentErrorID.CreateBundleAndSign,
      "Error signing DataItem",
      err,
    );
  }

  // TODO: Missing return type?
  return { dataItem: { raw: dataItem.getRaw(), id: dataItem.id } };
}
