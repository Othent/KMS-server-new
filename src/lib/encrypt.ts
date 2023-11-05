import { kmsClient } from './utils/kmsClient.js';
import { changeId } from './utils/changeId.js';


export default async function encrypt(plaintext: Uint8Array | string | null, keyName: string): Promise<any> {

    const safeId = changeId(keyName)

    // const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/${safeId}`
    const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/edkey`

    const [result] = await kmsClient.encrypt({
        name: fullKeyName,
        plaintext: plaintext
    });

    if (!result || !result.ciphertext) {
        throw new Error('Encryption failed or returned null/undefined ciphertext');
    }

    return { data: result.ciphertext.toString() }

}
