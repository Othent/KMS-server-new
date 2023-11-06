import { kmsClient } from './utils/kms/kmsClient';
import { changeId } from './utils/tools/changeId';


export default async function encrypt(plaintext: Buffer, keyName: string): Promise<any> {

    if (!plaintext || !keyName || !process.env.kmsProjectId) {
        console.log('Please specify both plaintext/keyName/process.env.kmsProjectId')
        throw new Error('Please specify both plaintext/keyName/process.env.kmsProjectId')
    }

    const safeId = changeId(keyName)

    const fullKeyName = kmsClient.cryptoKeyPath(process.env.kmsProjectId, 'global', safeId, 'encryptDecrypt')

    try {

        const [encryptResponse] = await kmsClient.encrypt({
            name: fullKeyName,
            plaintext: plaintext,
        });

        if (!encryptResponse || !encryptResponse.ciphertext) {
            console.log('Encryption failed or returned null/undefined ciphertext')
            throw new Error('Encryption failed or returned null/undefined ciphertext');
        }


        return { data: encryptResponse.ciphertext }

    } catch (e) {
        console.log(e)
    }


}
