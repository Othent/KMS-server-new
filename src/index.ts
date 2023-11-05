// @ts-ignore
import express from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import bodyParser from 'body-parser';
import multer from 'multer';
const upload = multer();
const app: express.Application = express();
app.use(cors({
  origin: '*',
}));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));



// Home (ping)
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ response: true });
});



// Create user
import createUser from './lib/createUser.js';
app.post('/create-user', (req: express.Request, res: express.Response) => {
  createUser(req.body.accessToken)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Decrypt
import decrypt from './lib/decrypt.js';
app.post('/decrypt', upload.single('ciphertext'), (req: express.Request, res: express.Response) => {
  decrypt(req.body.ciphertext, req.body.keyName)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Encrypt
import encrypt from './lib/encrypt.js';
app.post('/encrypt', upload.single('plaintext'), (req: express.Request, res: express.Response) => {
  encrypt(req.body.plaintext, req.body.keyName)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Get public key
import getPublicKey from './lib/getPublicKey.js';
app.post('/get-public-key', (req: express.Request, res: express.Response) => {
  getPublicKey(req.body.keyName)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Sign
import sign from './lib/sign.js';
app.post('/sign', upload.single('data'), (req: express.Request, res: express.Response) => {
  sign(req.body.data, req.body.keyName)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Start up server
app.listen(3001, () => {
  console.log(`Server **LIVE** listening on port 3001`);
});



export default app;
