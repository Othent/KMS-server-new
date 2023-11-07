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

    const uint8Array = new Uint8Array(Object.values(data));

    try {

        const [signResponse] = await kmsClient.asymmetricSign({
            name: fullKeyName,
            data: uint8Array
        });

        const safeRes = signResponse.signature

        return { data: safeRes };

    } catch (e) {
        console.log(e)
    }

}
