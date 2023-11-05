import { kmsClient } from './utils/kmsClient.js';
import { changeId } from './utils/changeId.js';


export default async function decrypt(ciphertext: string, keyName: string): Promise<any> {

    if (!ciphertext || !keyName) {
        throw new Error('Please specify both ciphertext/keyName')
    }

    const safeId = changeId(keyName);
    // const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/${safeId}`;
    const fullKeyName = `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/edkey`;

    const [result] = await kmsClient.decrypt({
        name: fullKeyName,
        ciphertext: ciphertext,
    });

    if (!result || !result.plaintext) {
        throw new Error('Decryption failed or returned null/undefined plaintext');
    }

    return { data: result.plaintext.toString() }

}
