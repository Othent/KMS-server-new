export enum OthentErrorID {
  Unexpected = "Unexpected",
  Validation = "Validation",
  UserCreation = "UserCreation",
  Encryption = "Encryption",
  Decryption = "Decryption",
  Signing = "Signing",
  PublicKey = "PublicKey",
}

export function getErrorResponse(error: unknown) {
  // TODO: if instance of OthentError add developer details in development, etc.

  let errorID = "";
  let errorMessage = "";
  let developerMessage;

  if (error instanceof OthentError) {
    errorID = error.id;
    errorMessage = error.message;
    developerMessage = error.developerMessage;
  } else if (error instanceof Error) {
    errorID = error.name;
    errorMessage = error.message;
  } else {
    errorID = OthentErrorID.Unexpected;
  }

  // TODO: Only add `developerMessage` in development:

  // TODO: Return different params to be able to re-throw the error on the frontend.

  return {
    success: false,
    errorID,
    errorMessage,
    developerMessage,
  };
}

// Custom JWT error...

export class OthentError extends Error {
  id: OthentErrorID;
  developerMessage?: string;

  constructor(id: OthentErrorID, developerMessage?: string, error?: unknown) {
    super();

    this.id = id;
    this.message = "";
    this.developerMessage = developerMessage;
  }
}
