import { updateAuth0User } from "../../utils/auth/auth0.utils";
import { IdTokenWithData } from "../../utils/auth/auth0.types";
import { CreateUserIdTokenData, LegacyCreateUserIdTokenData } from "./create-user.handler";
import { delay } from "../../utils/tools/delay";
import { createKeyRing, createSignKey, createEncryptDecryptKey, createImportJob } from "./createUser.utils";
import { notifyUserCreationOnSlack } from "../../utils/slack/slack.utils";
import { ACTIVATE_KEYS_INTERVALS, activateKeys } from "../activate-keys/activate-keys";
import { CryptoKeyVersionState } from "../../utils/kms/google-kms.utils";
import { logRequestInfo } from "../../utils/log/log.utils";

export async function createUser(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
  importOnly: boolean,
): Promise<IdTokenWithData<null> | null> {
  // All these createXYZ functions below will fail silently if the entity they are trying to create already exists, so that `createUser()` is idempotent and
  // just becomes a NOOP once the user has been fully created:

  await createKeyRing(idToken);

  await Promise.all([
    createSignKey(idToken, importOnly),
    createEncryptDecryptKey(idToken, importOnly),
    importOnly ? createImportJob(idToken) : undefined,
  ]);

  let activateKeysAttempt = 0;
  let areKeysActive = false;

  do {
    const nextAttemptAfter = ACTIVATE_KEYS_INTERVALS[activateKeysAttempt++];

    await delay(nextAttemptAfter);

    logRequestInfo(`Attempt ${ activateKeysAttempt } / ${ ACTIVATE_KEYS_INTERVALS.length }...`);

    const activateKeyResult = await activateKeys(idToken).catch((err) => {
      return null;
    });

    areKeysActive = (
      activateKeyResult?.signKeyState === CryptoKeyVersionState.ENABLED &&
      activateKeyResult?.encryptDecryptKeyState === CryptoKeyVersionState.ENABLED
    );
  } while (activateKeysAttempt < ACTIVATE_KEYS_INTERVALS.length && !areKeysActive);

  if (areKeysActive) {
    logRequestInfo("Keys activated!")
  } else {
    throw new Error("Timed out while trying to activate keys.");
  }

  notifyUserCreationOnSlack(idToken);

  if (importOnly) return null;

  // This will throw an error if `idToken` already contains `authSystem`, `owner`, or `walletAddress`. While the user creation process can be resumed /
  // reattempted if any of the Google KMS entities creation fails, once Auth0's `user_metadata` has been updated, this endpoint should never be called again.
  //
  // If for some weird reason there's an issue where an Auth0 user has been only partially updated, we'll have to resolve it manually (delete the Auth0 user
  // before trying to sign up again).

  const userMetadata = await updateAuth0User(idToken);

  return { ...idToken, ...userMetadata, data: null } satisfies IdTokenWithData<null>;
}
