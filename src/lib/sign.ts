import { kmsClient } from './utils/kms/kmsClient';
import { changeId } from './utils/tools/changeId';


export default async function sign(data: any, keyName: string): Promise<any> {

    if (!data || !keyName || !process.env.kmsProjectId) {
        console.log(data, keyName, process.env.kmsProjectId)
        console.log('Please specify both data/keyName/process.env.kmsProjectId')
        throw new Error('Please specify both data/keyName/process.env.kmsProjectId')
    }

    const safeId = changeId(keyName);

    const fullKeyName = kmsClient.cryptoKeyVersionPath(process.env.kmsProjectId, 'global', safeId, 'sign', '4');

    const uint8Array = Buffer.from(data)

    try {

        const [signResponse] = await kmsClient.asymmetricSign({
            name: fullKeyName,
            data: uint8Array
        });

        const safeRes = JSON.stringify(signResponse.signature)

        return { data: safeRes };

    } catch (e) {
        console.log(e)
    }

}
