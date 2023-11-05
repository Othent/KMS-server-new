import { kmsClient } from './utils/kmsClient.js';
import { changeId } from './utils/changeId.js';


export default async function sign(data: Uint8Array|string|null, keyName: string): Promise<any> {

    const safeId = changeId(keyName);
    // const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/${safeId}/cryptoKeyVersions/1`;
    const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/signkey/cryptoKeyVersions/1`;

    const [signResponse] = await kmsClient.asymmetricSign({
        name: fullKeyName,
        data: data
    });

    return { data: signResponse };
}
