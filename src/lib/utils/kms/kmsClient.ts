import { KeyManagementServiceClient } from '@google-cloud/kms';


if (!process.env.googleCredentials) {
    console.log('Please specify a googleCredentials file in the .env')
    throw new Error('Please specify a googleCredentials file in the .env')
}

export const kmsClient = new KeyManagementServiceClient({ credentials: JSON.parse(process.env.googleCredentials) });
