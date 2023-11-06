import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
const upload = multer();
const app: express.Application = express();
app.use(cors({
  origin: '*',
}));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
import * as dotEnv from 'dotenv'
dotEnv.config()


// Home (ping)
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ response: true });
});



// Create user
import createUser from './lib/createUser';
app.post('/create-user', (req: express.Request, res: express.Response) => {
  console.log('\x1b[36m%s\x1b[0m', `Request: /create-user, body: ${JSON.stringify(req.body)}`)
  createUser(req.body.accessToken)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Decrypt
import decrypt from './lib/decrypt';
app.post('/decrypt', upload.single('ciphertext'), (req: express.Request, res: express.Response) => {
  console.log('\x1b[36m%s\x1b[0m', `Request: /decrypt, body: ${JSON.stringify(req.body)}`)
  decrypt(req.body.ciphertext, req.body.keyName)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Encrypt
import encrypt from './lib/encrypt';
app.post('/encrypt', upload.single('plaintext'), (req: express.Request, res: express.Response) => {
  console.log('\x1b[36m%s\x1b[0m', `Request: /encrypt, body: ${JSON.stringify(req.body)}`)
  encrypt(req.body.plaintext, req.body.keyName)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Get public key
import getPublicKey from './lib/getPublicKey';
app.post('/get-public-key', (req: express.Request, res: express.Response) => {
  console.log('\x1b[36m%s\x1b[0m', `Request: /get-public-key, body: ${JSON.stringify(req.body)}`)
  getPublicKey(req.body.keyName)
    .then((response: any) => {
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});



// Sign
import sign from './lib/sign';
app.post('/sign', (req: express.Request, res: express.Response) => {
  console.log('\x1b[36m%s\x1b[0m', `Request: /sign, body: ${JSON.stringify(req.body)}`)
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
  console.log('\x1b[36m%s\x1b[0m', `Server **LIVE** listening on port 3001`)
});



export default app;
