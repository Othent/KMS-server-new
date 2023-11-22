import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
const upload = multer();
const app: express.Application = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
import * as dotEnv from "dotenv";
dotEnv.config();
import { verifyJWT } from "./lib/utils/auth/verifyJWT";
import { OTHENT_PUBLIC_KEY } from "./lib/utils/auth/verifyJWT";

// Home (ping)
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({ response: true });
});

// Create user
import createUser from "./lib/createUser";
app.post("/create-user", async (req, res) => {
  try {
    const accessToken = await verifyJWT(
      req.body.encodedData,
      OTHENT_PUBLIC_KEY,
    );

    if (accessToken) {
      console.log(
        "\x1b[36m%s\x1b[0m",
        `\nRequest: /create-user, body: ${JSON.stringify(accessToken)}`,
      );

      const response = await createUser(accessToken);
      console.log(
        "\x1b[32m",
        `Response: /create-user: ${JSON.stringify(response)}`,
      );
      res.json(response);
    } else {
      res.json({ success: false, error: "Invalid JWT" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.json({ success: false, error: error.message });
    } else {
      res.json({ success: false, error: "An unknown error occurred" });
    }
  }
});

// Decrypt
import decrypt from "./lib/decrypt";
app.post("/decrypt", upload.single("ciphertext"), async (req, res) => {
  try {
    const accessToken = await verifyJWT(
      req.body.encodedData,
      OTHENT_PUBLIC_KEY,
    );

    if (accessToken) {
      console.log(
        "\x1b[36m%s\x1b[0m",
        `\nRequest: /decrypt, body: ${JSON.stringify(accessToken)}`,
      );

      const response = await decrypt(
        accessToken.data.ciphertext,
        accessToken.data.keyName,
      );
      console.log(
        "\x1b[32m",
        `Response: /decrypt: ${JSON.stringify(response)}`,
      );
      res.send(response);
    } else {
      res.json({ success: false, error: "Invalid JWT" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.json({ success: false, error: error.message });
    } else {
      res.json({ success: false, error: "An unknown error occurred" });
    }
  }
});

// Encrypt
import encrypt from "./lib/encrypt";
app.post("/encrypt", upload.single("plaintext"), async (req, res) => {
  try {
    const accessToken = await verifyJWT(
      req.body.encodedData,
      OTHENT_PUBLIC_KEY,
    );

    if (accessToken) {
      console.log(
        "\x1b[36m%s\x1b[0m",
        `\nRequest: /encrypt, body: ${JSON.stringify(accessToken)}`,
      );

      const response = await encrypt(
        accessToken.data.plaintext,
        accessToken.data.keyName,
      );
      console.log(
        "\x1b[32m",
        `Response: /encrypt: ${JSON.stringify(response)}`,
      );
      res.send(response);
    } else {
      res.json({ success: false, error: "Invalid JWT" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.json({ success: false, error: error.message });
    } else {
      res.json({ success: false, error: "An unknown error occurred" });
    }
  }
});

// Get public key
import getPublicKey from "./lib/getPublicKey";
app.post("/get-public-key", async (req, res) => {
  try {
    const accessToken = await verifyJWT(
      req.body.encodedData,
      OTHENT_PUBLIC_KEY,
    );

    if (accessToken) {
      console.log(
        "\x1b[36m%s\x1b[0m",
        `\nRequest: /get-public-key, body: ${JSON.stringify(accessToken)}`,
      );

      const response = await getPublicKey(accessToken.data.keyName);
      console.log(
        "\x1b[32m",
        `Response: /get-public-key: ${JSON.stringify(response)}`,
      );
      res.json(response);
    } else {
      res.json({ success: false, error: "Invalid JWT" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.json({ success: false, error: error.message });
    } else {
      res.json({ success: false, error: "An unknown error occurred" });
    }
  }
});

// Sign
import sign from "./lib/sign";
app.post("/sign", async (req, res) => {
  try {
    const accessToken = await verifyJWT(
      req.body.encodedData,
      OTHENT_PUBLIC_KEY,
    );

    if (accessToken) {
      console.log(
        "\x1b[36m%s\x1b[0m",
        `\nRequest: /sign, body: ${JSON.stringify(accessToken)}`,
      );

      const response = await sign(
        accessToken.data.data,
        accessToken.data.keyName,
      );
      console.log("\x1b[32m", `Response: /sign: ${JSON.stringify(response)}`);
      res.send(response);
    } else {
      res.json({ success: false, error: "Invalid JWT" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.json({ success: false, error: error.message });
    } else {
      res.json({ success: false, error: "An unknown error occurred" });
    }
  }
});

// Start up server
const port = process.env.PORT;
app.listen(port, () => {
  console.log("\x1b[32m", `Server **LIVE** listening on port ${port}`);
});

export default app;
