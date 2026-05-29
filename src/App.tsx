
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
  const [encryptedPackageIn, setEncryptedPackageIn] = useState<string>('');
  const [secretKeyIn, setSecretKeyIn] = useState<string>('');
  

  return (
    <>
      <div id="keyGen">
        <h2>Key Pair Generation (Remember to write both of these down! You should probably not spend the time manually writing this on a piece of paper and store it in a text file)</h2>
        <button onClick={async () => {
          const { publicKey, secretKey } = await vgpGenerateKeyPair();
          console.log(publicKey.length);
          console.log(Buffer.from(publicKey).toString('base64').length);
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
        <form onSubmit={async (e) => {
          e.preventDefault();
          const publicKey = new Uint8Array(
            Buffer.from(publicKeyIn, 'base64')
          );
          console.log("publicKey length:", publicKey.length);
          console.log(publicKey);
          console.log("publicKey length:", publicKeyIn.length);
  console.log(publicKeyIn);
          const message = messageIn;
          const symetricPackage : symmetricPackage = {message: message};
          const encryptedPackage : encryptedPackage = await vgpEncrypt(symetricPackage, publicKey);
          const base64 = Buffer.from(JSON.stringify(encryptedPackage)).toString("base64");
          setEncryptedPackageOut(base64);
          console.log(base64);


          }}>
        <textarea
  value={publicKeyIn}
  onChange={(event) => setPublicKeyIn(event.target.value)}
  placeholder="Enter public key here"
  rows={10}
  cols={100}
/>
        <input type="text" value={messageIn} onChange={(event) => setMessageIn(event.target.value)} placeholder="Enter message here"></input>
        <input type="submit" ></input>
        </form>
        <h3>The encrypted message: </h3>
        <p>{encryptedPackageOut}</p>
        <button
onClick={() => {navigator.clipboard.writeText(encryptedPackageOut)}}> Copy</button>

      </div>
      <div id="decryption">
        <h2>Decryption</h2>
        <p>To decrypt a message, you will need the encrypted package (the output from the encryption section) and the secret key corresponding to the public key used for encryption.</p>
        <p>Enter the encrypted package (in base64 format) and your secret key (in base64 format) below:</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const secretKey = new Uint8Array(
            Buffer.from(secretKeyIn, 'base64')
          );
          console.log("secretKey length:", secretKey.length);
          console.log(secretKey);
          console.log("secretKey length:", secretKeyIn.length);
  console.log(secretKeyIn);
          const encryptedPackageJson = Buffer.from(encryptedPackageIn, 'base64').toString('utf-8');
          const encryptedPackage : encryptedPackage = JSON.parse(encryptedPackageJson);
          const decryptedPackage : decryptedPackage = await vgpDecrypt(encryptedPackage, secretKey);
          alert("Decrypted message: " + decryptedPackage.message);


          }}>
        <textarea
  value={encryptedPackageIn}
  onChange={(event) => setEncryptedPackageIn(event.target.value)}
  placeholder="Enter encrypted package here"
  rows={10}
  cols={100}
/>       
<textarea
  value={secretKeyIn}
  onChange={(event) => setSecretKeyIn(event.target.value)}
  placeholder="Enter secret key here"
  rows={10}
  cols={100}
/>  
        </form>
      </div>
     
    </>
  )
}

export default App

async function generateMlKemKeyPair() 
{
  const keypair = await createMlKem1024();
  const [publicKey, secretKey] = keypair.generateKeyPair();
  console.log(publicKey.length);
  return { publicKey, secretKey };
}


async function generateSymKeyAndEncryptMlKem(publicKey: Uint8Array)
{
  const sender = await createMlKem1024();
  console.log("publicKey length:", publicKey.length);
  console.log(publicKey);
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
