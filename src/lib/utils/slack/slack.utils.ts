import axios from "axios";
import { CreateUserIdTokenData, LegacyCreateUserIdTokenData } from "../../operations/create-user/create-user.handler";
import { CONFIG } from "../../server/config/config.utils";
import { IdTokenWithData } from "../auth/auth0.utils";
import { getKeyRingIdFromIdToken } from "../kms/google-kms.utils";

export async function notifyUserCreationOnSlack(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
) {
  const keyRingId = getKeyRingIdFromIdToken(idToken);

  // TODO: Add social provider too:
  const message = `New account generated on Othent 2.0 ${keyRingId}`;

  return axios.post(
    "https://slack.com/api/chat.postMessage",
    {
      channel: CONFIG.SLACK_CHANNEL_ID,
      text: message,
    },
    {
      headers: {
        Authorization: `Bearer ${CONFIG.SLACK_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );
}
