/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
// @ts-ignore
exports.onExecutePostLogin = async (event, api) => {
  if (!event.user.email_verified) {
    return api.access.deny("Please verify your email before logging in.");
  }
};
