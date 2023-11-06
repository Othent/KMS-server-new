import { kmsClient } from './utils/kms/kmsClient';
import { changeId } from './utils/tools/changeId';
import { pem2jwk } from 'pem-jwk'


export default async function getPublicKey(keyName: string): Promise<any> {

    if (!keyName || !process.env.kmsProjectId) {
        console.log(keyName, process.env.kmsProjectId)
        console.log('Please specify both keyName/process.env.kmsProjectId')
        throw new Error('Please specify both keyName/process.env.kmsProjectId')
    }

    const safeId = changeId(keyName);

    const fullKeyName = kmsClient.cryptoKeyVersionPath(process.env.kmsProjectId, 'global', safeId, 'sign', '1');

    const [publicKeyResponse] = await kmsClient.getPublicKey({
        name: fullKeyName,
    });

    const pem = publicKeyResponse.pem
    // @ts-ignore, ignore types for pem file
    const publicKey = pem2jwk(pem)

    return { data: publicKey.n }

}
