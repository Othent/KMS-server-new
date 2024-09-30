import axios from "axios";
import { CreateUserIdTokenData, LegacyCreateUserIdTokenData } from "../../operations/create-user/create-user.handler";
import { CONFIG } from "../../server/config/config.utils";
import { IdTokenWithData } from "../auth/auth0.types";
import { getKeyRingIdFromIdToken } from "../kms/google-kms.utils";
import { Route } from "../../server/server.constants";
import { OthentErrorID, OthentServerError } from "../../server/errors/error";

export async function notifyUserCreationOnSlack(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
) {
  // Skip the Slack ping when running locally:
  if (!CONFIG.SLACK_ENABLED) return;

  try {
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
  } catch (err) {
    console.log("notifyUserCreationOnSlack failed silently:", err);
  }
}

export async function notifyErrorOnSlack(
  path: Route,
  err: unknown,
) {
  // Skip the Slack ping when running locally:
  if (!CONFIG.SLACK_ENABLED) return;

  try {
    let errorID: OthentErrorID = OthentErrorID.Unexpected;
    let message = "-";

    if (err instanceof OthentServerError) {
      errorID = err.id;
      message = err.developerMessage;
    } else if (err instanceof Error) {
      message = `${ err.name }: ${ err.message }`;
    }

    const errorLabel = OthentErrorID[errorID];

    // See https://api.slack.com/reference/surfaces/formatting#mentioning-users:
    // @U078JMS4DNY = Dani
    // @U050DHG4VUH = Matias
    const messageWithMentions = `<@U078JMS4DNY> <@U050DHG4VUH> ${ errorLabel } error at ${ path }: ${ message }`;

    return axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: CONFIG.SLACK_CHANNEL_ID,
        text: messageWithMentions,
      },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.SLACK_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.log("notifyErrorOnSlack failed silently:", err);
  }
}
