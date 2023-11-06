import { KeyManagementServiceClient } from '@google-cloud/kms';
import * as dotEnv from 'dotenv'
dotEnv.config()

export const kmsClient = (() => {
  if (!process.env.googleCredentials) {
    console.log('Please specify a googleCredentials file in the .env');
    throw new Error('Please specify a googleCredentials file in the .env');
  }

  return new KeyManagementServiceClient({ credentials: JSON.parse(process.env.googleCredentials) });
})();
