
import { createMlKem1024} from "mlkem";
import './App.css'
import * as crypto from 'crypto';
import { Buffer } from 'buffer';
function App() {

  return (
    <>
      
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
  const initializationVector = Buffer.from(crypto.randomBytes(12), 'utf8');
  const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, initializationVector);

  let enc = cipher.update(plainText, 'utf8', 'base64');
  enc += cipher.final('base64');
  const symmetricKeyPackage: symmetricKeyPackage = {
    cipherText: Buffer.from(symmetricKey),
    initializationVector,
    authTag: Buffer.from(cipher.getAuthTag())
  }
  return symmetricKeyPackage;
}

function decryptWithSymmetricKeyBase64(symmetricKeyPackage: symmetricKeyPackage, symmetricKey: Uint8Array) 
{
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(symmetricKey), Buffer.from(symmetricKeyPackage.initializationVector));
  decipher.setAuthTag(Buffer.from(symmetricKeyPackage.authTag));
  let str = decipher.update(symmetricKeyPackage.cipherText, 'base64', 'utf8');
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
  const symmetricKeyPackage = encryptWithSymmetricKeyBase64(symetricPackage.message, sharedSymmetricSecret);
  
  return { cipherText, symmetricKeyPackage };
}
type symmetricPackage = {
  message: string;
};
type symmetricKeyPackage = {
  cipherText: Uint8Array;
  initializationVector: Buffer;
  authTag: Buffer;
}

async function vgpEncrypt(symmetricPackage: symmetricPackage, publicKey: Uint8Array)
{
  const { cipherText, symmetricKeyPackage } = await mlKemPlusAesEncrypt(symmetricPackage, publicKey);
  return { cipherText, symmetricKeyPackage };
}