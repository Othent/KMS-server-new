import signFunction from "./sign";
import { createData, Signer } from "arbundles";
import base64url from "base64url";

export default async function createBundleAndSign(
  data: any,
  keyName: string,
  owner: string,
  tags: any,
): Promise<any> {
  try {
    const dataUint8Array = new Uint8Array(Object.values(data));

    async function sign(message: Uint8Array) {
      const signedData = await signFunction(message, keyName);
      return signedData.data;
    }

    function getPublicKey() {
      return base64url.toBuffer(owner);
    }

    const signer: Signer = {
      publicKey: getPublicKey(),
      signatureType: 1,
      signatureLength: 512,
      ownerLength: 512,
      // @ts-ignore
      sign,
      // @ts-ignore
      verify: null,
    };

    let dataEntry = createData(dataUint8Array, signer, { tags });

    try {
      await dataEntry.sign(signer);
    } catch (error) {
      console.log(error);
    }

    return { dataEntry: { raw: dataEntry.getRaw(), id: dataEntry.id } };
  } catch (e) {
    throw new Error(`Error creating bundling and signing data. ${e}`);
  }
}
