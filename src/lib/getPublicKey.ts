import { kmsClient } from './utils/kmsClient.js';
import { changeId } from './utils/changeId.js';
import { pem2jwk } from 'pem-jwk'



export default async function getPublicKey(keyName: string): Promise<any> {

    const safeId = changeId(keyName);

    // const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/${safeId}/cryptoKeyVersions/1`;
    const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/signkey/cryptoKeyVersions/1`;

    const [publicKeyResponse] = await kmsClient.getPublicKey({
        name: fullKeyName,
    });

    const pem = publicKeyResponse.pem
    // @ts-ignore, ignore types for pem file
    const publicKey = pem2jwk(pem)

    return { data: publicKey.n }

}
