import { kmsClient } from './utils/kms/kmsClient';
import { changeId } from './utils/tools/changeId';


export default async function decrypt(ciphertext: string, keyName: string): Promise<any> {

    if (!ciphertext || !keyName || !process.env.kmsProjectId) {
        console.log(ciphertext, keyName, process.env.kmsProjectId)
        console.log('Please specify both ciphertext/keyName/process.env.kmsProjectId')
        throw new Error('Please specify both ciphertext/keyName/process.env.kmsProjectId')
    }

    const safeId = changeId(keyName);

    const fullKeyName = kmsClient.cryptoKeyPath(process.env.kmsProjectId, 'global', safeId, 'encryptDecrypt');

    try {

        const [decryptResponse] = await kmsClient.decrypt({
            name: fullKeyName,
            ciphertext: ciphertext,
        });

        if (!decryptResponse || !decryptResponse.plaintext) {
            console.log('Decryption failed or returned null/undefined plaintext')
            throw new Error('Decryption failed or returned null/undefined plaintext');
        }

        return { data: decryptResponse }

    } catch (e) {
        console.log(e)
    }

}
