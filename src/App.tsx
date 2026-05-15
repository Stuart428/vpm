
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
  const symmetricEncryptedDataPackage: symmetricEncryptedDataPackage = {
    cipherText: Buffer.from(symmetricKey),
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
  cipherText: Uint8Array;
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
