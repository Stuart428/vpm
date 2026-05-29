import { createMlKem1024 } from 'mlkem';
import * as crypto from 'crypto';
import { Buffer } from 'buffer';
import type {
  SymmetricPackage,
  SymmetricEncryptedDataPackage,
  EncryptedPackage,
  DecryptedPackage,
} from '../types';

export async function vgpGenerateKeyPair() {
  const kem = await createMlKem1024();
  const [publicKey, secretKey] = kem.generateKeyPair();
  return { publicKey, secretKey };
}

async function generateSymKeyAndEncryptMlKem(publicKey: Uint8Array) {
  const kem = await createMlKem1024();
  const [cipherText, sharedSymmetricSecret] = kem.encap(publicKey);
  return { cipherText, sharedSymmetricSecret };
}

async function decryptMlKem(cipherText: Uint8Array, secretKey: Uint8Array) {
  const kem = await createMlKem1024();
  return kem.decap(cipherText, secretKey);
}

function encryptWithSymmetricKeyBase64(
  plainText: string,
  symmetricKey: Uint8Array,
): SymmetricEncryptedDataPackage {
  const initializationVector = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, initializationVector);

  let cipherText = cipher.update(plainText, 'utf8', 'base64');
  cipherText += cipher.final('base64');

  return {
    cipherText,
    initializationVector,
    authTag: Buffer.from(cipher.getAuthTag()),
  };
}

function decryptWithSymmetricKeyBase64(
  encryptedPackage: SymmetricEncryptedDataPackage,
  symmetricKey: Uint8Array,
) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(symmetricKey),
    Buffer.from(encryptedPackage.initializationVector),
  );
  decipher.setAuthTag(Buffer.from(encryptedPackage.authTag));

  let output = decipher.update(encryptedPackage.cipherText, 'base64', 'utf8');
  output += decipher.final('utf8');
  return output;
}

export async function vgpEncrypt(
  symmetricPackage: SymmetricPackage,
  publicKey: Uint8Array,
): Promise<EncryptedPackage> {
  const { cipherText, sharedSymmetricSecret } = await generateSymKeyAndEncryptMlKem(publicKey);
  const symmetricEncryptedDataPackage = encryptWithSymmetricKeyBase64(
    symmetricPackage.message,
    sharedSymmetricSecret,
  );

  return {
    encryptedSymmetricKey: cipherText,
    symmetricEncryptedDataPackage,
  };
}

export async function vgpDecrypt(
  encryptedPackage: EncryptedPackage,
  secretKey: Uint8Array,
): Promise<DecryptedPackage> {
  const sharedSymmetricSecret = await decryptMlKem(
    encryptedPackage.encryptedSymmetricKey,
    secretKey,
  );
  const message = decryptWithSymmetricKeyBase64(
    encryptedPackage.symmetricEncryptedDataPackage,
    sharedSymmetricSecret,
  );
  return { message };
}

export function encodeBase64(value: Uint8Array | Buffer): string {
  return Buffer.from(value).toString('base64');
}

export function decodeBase64ToUint8Array(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64'));
}

export function serializeEncryptedPackage(encryptedPackage: EncryptedPackage): string {
  return Buffer.from(
    JSON.stringify({
      encryptedSymmetricKey: encodeBase64(encryptedPackage.encryptedSymmetricKey),
      symmetricEncryptedDataPackage: {
        cipherText: encryptedPackage.symmetricEncryptedDataPackage.cipherText,
        initializationVector: encodeBase64(
          encryptedPackage.symmetricEncryptedDataPackage.initializationVector,
        ),
        authTag: encodeBase64(encryptedPackage.symmetricEncryptedDataPackage.authTag),
      },
    }),
    'utf8',
  ).toString('base64');
}

export function deserializeEncryptedPackage(encodedPackage: string): EncryptedPackage {
  const parsed = JSON.parse(Buffer.from(encodedPackage, 'base64').toString('utf8'));
  return {
    encryptedSymmetricKey: decodeBase64ToUint8Array(parsed.encryptedSymmetricKey),
    symmetricEncryptedDataPackage: {
      cipherText: parsed.symmetricEncryptedDataPackage.cipherText,
      initializationVector: Buffer.from(
        parsed.symmetricEncryptedDataPackage.initializationVector,
        'base64',
      ),
      authTag: Buffer.from(parsed.symmetricEncryptedDataPackage.authTag, 'base64'),
    },
  };
}
