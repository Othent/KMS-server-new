import { kmsClient } from './kmsClient.js';
import jwkToPem from 'jwk-to-pem';
import { GenerateKeyReturnType, ImportKeyReturnType, ImportCryptoKeyReturnType } from '../../types/operations/importKey';
import { generateKey } from './generateKey.js';
import { ownerToAddress } from './arweaveUtils.js';


export default async function importKey(): Promise<ImportKeyReturnType> {
    const { mnemonic, JWK }: GenerateKeyReturnType = await generateKey();
    
    const pemJWK = jwkToPem(JWK, { private: true });


    const keyImportParams = {
        parent: 'projects/auth-custom-try/locations/global/keyRings/Canada-Dry',
        keyAlgorithm: 'RSA_DECRYPT_OAEP_2048_SHA256',
        importJob: 'YOUR_IMPORT_JOB',
        rsaAesWrappedKey: pemJWK,
    };

    await kmsClient.importCryptoKey(keyImportParams);

    const walletAddress = await ownerToAddress(JWK.n)

    return { mnemonic, walletAddress };
}
