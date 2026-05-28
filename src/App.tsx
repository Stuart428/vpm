
import { createMlKem1024} from "mlkem";
import './App.css'
import * as crypto from 'crypto';
import { Buffer } from 'buffer';

import { useState} from 'react';

function App() {
  const [publicKeyOut, setPublicKeyOut] = useState<string>('');
  const [secretKeyOut, setSecretKeyOut] = useState<string>('');
  const [publicKeyIn, setPublicKeyIn] = useState<string>('');
  const [messageIn, setMessageIn] = useState<string>('');
  const [encryptedPackageOut, setEncryptedPackageOut] = useState<string>('');
  

  return (
    <>
      <div id="keyGen">
        <h2>Key Pair Generation (Remember to write both of these down! You should probably not spend the time manually writing this on a piece of paper and store it in a text file)</h2>
        <button onClick={async () => {
          const { publicKey, secretKey } = await vgpGenerateKeyPair();
          setPublicKeyOut(Buffer.from(publicKey).toString('base64'));
          setSecretKeyOut(Buffer.from(secretKey).toString('base64'));
        }}>Generate Key Pair </button>
        <h3>Public Key (Send this to anyone who you want to communicate securely with): </h3>
        <p id="keyGenPublicKeyOut">{publicKeyOut}</p>
        <button
onClick={() => {navigator.clipboard.writeText(publicKeyOut)}}> Copy</button>
        <h3>Secret Key (Keep this secret and do not share it with anyone): </h3>
        <p id="keyGenSecretKeyOut">{secretKeyOut}</p>
        <button
onClick={() => {navigator.clipboard.writeText(secretKeyOut)}}> Copy</button>
      </div>

      <div id="encryption">
        <h2>Encryption</h2>
        <p>To encrypt a message, you will need the recipient's public key. You can use the public key generated in the previous section or any other valid public key.</p>
        <p>Enter the message you want to encrypt and the recipient's public key (in base64 format) below:</p>
        {/*todo: add encryption functionality here ref={inputRef}*/}
        <form>
        <input type="password" value={publicKeyIn} onChange={(event) => setPublicKeyIn(event.target.value)}>Enter Key Here</input>
        <input type="text" value={messageIn} onChange={(event) => setMessageIn(event.target.value)}>Enter message here</input>
        <input type="submit" onClick={async () => {
          const publicKey = Buffer.from(publicKeyIn, 'base64');
          const message = messageIn;
          const symetricPackage : symmetricPackage = {message: message};
          const encryptedPackage : encryptedPackage = await vgpEncrypt(symetricPackage, publicKey);
          const base64 = Buffer.from(JSON.stringify(encryptedPackage)).toString("base64");
          setEncryptedPackageOut(base64);


          }}>Encrypt</input>
        </form>
        <h3>The encrypted message: </h3>
        <p>{encryptedPackageOut}</p>
        <button
onClick={() => {navigator.clipboard.writeText(encryptedPackageOut)}}> Copy</button>

      </div>
     
    </>
  )
}

export default App

async function generateMlKemKeyPair() 
{
  const keypair = await createMlKem1024();
  const [publicKey, secretKey] = keypair.generateKeyPair();
  return { publicKey, secretKey };
}

async function generateSymKeyAndEncryptMlKem(publicKey: Uint8Array)
{
  const sender = await createMlKem1024();
  const [cipherText, sharedSymmetricSecret] = sender.encap(publicKey);
  return { cipherText, sharedSymmetricSecret };
}

async function decryptMlKem(cipherText: Uint8Array, secretKey: Uint8Array)
{
  const receiver = await createMlKem1024();
  const sharedSymmetricSecret = receiver.decap(cipherText, secretKey);
  return sharedSymmetricSecret;
}

function encryptWithSymmetricKeyBase64 (plainText: string, symmetricKey: Uint8Array) 
{
  const initializationVector = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, initializationVector);

  let enc = cipher.update(plainText, 'utf8', 'base64');
  enc += cipher.final('base64');
  
  const symmetricEncryptedDataPackage: symmetricEncryptedDataPackage = {
    cipherText: enc,
    initializationVector,
    authTag: Buffer.from(cipher.getAuthTag())
  }
  return symmetricEncryptedDataPackage;
}

function decryptWithSymmetricKeyBase64(symmetricEncryptedDataPackage: symmetricEncryptedDataPackage, symmetricKey: Uint8Array) 
{
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(symmetricKey), Buffer.from(symmetricEncryptedDataPackage.initializationVector));
  decipher.setAuthTag(Buffer.from(symmetricEncryptedDataPackage.authTag));
  let str = decipher.update(symmetricEncryptedDataPackage.cipherText, 'base64', 'utf8');
  str += decipher.final('utf8');
  return str;
}

async function vgpGenerateKeyPair() 
{
  const { publicKey, secretKey } = await generateMlKemKeyPair();
  return { publicKey, secretKey };
}

async function mlKemPlusAesEncrypt(symetricPackage: symmetricPackage, publicKey: Uint8Array) 
{
  const { cipherText, sharedSymmetricSecret } = await generateSymKeyAndEncryptMlKem(publicKey);
  const symmetricEncryptedDataPackage = encryptWithSymmetricKeyBase64(symetricPackage.message, sharedSymmetricSecret);
  
  return { cipherText, symmetricEncryptedDataPackage };
}
type symmetricPackage = {
  message: string;
};
type symmetricEncryptedDataPackage = {
  cipherText: string;
  initializationVector: Buffer;
  authTag: Buffer;
}
type encryptedPackage = {
  encryptedSymmetricKey: Uint8Array;
  symmetricEncryptedDataPackage: symmetricEncryptedDataPackage;
}

async function vgpEncrypt(symmetricPackage: symmetricPackage, publicKey: Uint8Array)
{
  const { cipherText, symmetricEncryptedDataPackage } = await mlKemPlusAesEncrypt(symmetricPackage, publicKey);
  const encryptedPackage: encryptedPackage = {
    encryptedSymmetricKey: cipherText,
    symmetricEncryptedDataPackage
  }
  return encryptedPackage;
}

type decryptedPackage = {
  message: string;
}
async function vgpDecrypt(encryptedPackage: encryptedPackage, secretKey: Uint8Array)
{
  const sharedSymmetricSecret = await decryptMlKem(encryptedPackage.encryptedSymmetricKey, secretKey);
  const decryptedMessage = decryptWithSymmetricKeyBase64(encryptedPackage.symmetricEncryptedDataPackage, sharedSymmetricSecret);
  const decryptedPackage: decryptedPackage = {
    message: decryptedMessage
  }
  return decryptedPackage;
}
