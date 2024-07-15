/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
// @ts-ignore
exports.onExecutePostLogin = async (event, api) => {
  if (event.authorization) {
    console.log(event.request);

    let transaction_input = event.request.query.transaction_input;

    transaction_input = JSON.parse(transaction_input);

    if (transaction_input.othentFunction === "KMS") {
      if (transaction_input.data) {
        api.idToken.setCustomClaim(`data`, transaction_input.data);
      }

      if (event.user.user_metadata.owner) {
        api.idToken.setCustomClaim(`owner`, event.user.user_metadata.owner);
      }

      if (event.user.user_metadata.walletAddress) {
        api.idToken.setCustomClaim(
          `walletAddress`,
          event.user.user_metadata.walletAddress,
        );
      }

      if (event.user.user_metadata.authSystem) {
        api.idToken.setCustomClaim(
          `authSystem`,
          event.user.user_metadata.authSystem,
        );
      }
    }
  }
};
