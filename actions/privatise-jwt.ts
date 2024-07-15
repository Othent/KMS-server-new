/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
// @ts-ignore
exports.onExecutePostLogin = async (event, api) => {
  const { user } = event;

  console.log("user =", user);
  console.log("user.private =", user.private);

  if (user.private === true) {
    api.idToken.setCustomClaim("email", "");
    api.idToken.setCustomClaim("email_verified", "");
    api.idToken.setCustomClaim("family_name", "");
    api.idToken.setCustomClaim("given_name", "");
    api.idToken.setCustomClaim("locale", "");
    api.idToken.setCustomClaim("nickname", "");
    api.idToken.setCustomClaim(`picture`, "https://othent.io/user.png");
  }

  return;
};
