import { IdTokenWithData, updateAuth0User } from "../../utils/auth/auth0";
import { CreateUserIdTokenData, LegacyCreateUserIdTokenData } from "./create-user.handler";
import { CONFIG } from "../../server/config/config.utils";
import { delay } from "../../utils/tools/delay";
import { createKeyRing, createSignKey, createEncryptDecryptKey, createImportJob } from "./createUser.utils";
import { notifyUserCreationOnSlack } from "../../utils/slack/slack.utils";

export async function createUser(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
  importOnly: boolean,
) {
  console.log(`createUser(${ importOnly ? "importOnly" : "generateKeys" })`);

  // TODO: Check if the keyRing / signKey / encryptDecryptKey already exists but the keys were never generated or
  // imported?

  await createKeyRing(idToken);

  await Promise.all([
    createSignKey(idToken, importOnly),
    createEncryptDecryptKey(idToken, importOnly),
    importOnly ? createImportJob(idToken) : undefined,
  ]);

  // Skip the Slack ping when running locally:
  if (CONFIG.SLACK_ENABLED) {
    // TODO: Notify only once the keys are generated?

    try {
      await notifyUserCreationOnSlack(idToken);
    } catch (err) {
      console.log("Ping failed silently:", err);
    }
  }

  // Wait for the key to be generated...
  // TODO: Replace with code that actually checks the key state:
  await delay(2000);

  if (!importOnly) {
    await updateAuth0User(idToken);
  }

  // TODO: Return the created user and keys status?
  return true;
}
