/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  if (event.authorization) {
    // Won't work without an extension. See https://auth0.com/docs/customize/extensions/real-time-webtask-logs
    // ONLY USE LOGGING IN DEVELOPMENT!
    // console.log(JSON.stringify(event.request, null, '  '));

    const transaction_input = event.request.query.transaction_input || event.request.body.transaction_input;

    let transactionInput = null;

    try {
      transactionInput = JSON.parse(transaction_input);

      if (!transactionInput) throw new Error("Missing `transaction_input`");
    } catch (err) {
      console.log(err.name, err.message);

      return;
    }

    if (transactionInput.othentFunction === "KMS") {
      if (transactionInput.data) {
        api.idToken.setCustomClaim(`data`, transactionInput.data);
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
