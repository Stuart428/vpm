import { useState, type FormEvent } from 'react';
import {
  decodeBase64ToUint8Array,
  encodeBase64,
  serializeEncryptedPackage,
  vgpEncrypt,
} from '../utils/cryptoUtils';
import type { EncryptedPackage } from '../types';

type EncryptionFormProps = {
  defaultPublicKey?: string;
  onEncryptedPackageGenerated: (packageBase64: string) => void;
};

export default function EncryptionForm({
  defaultPublicKey = '',
  onEncryptedPackageGenerated,
}: EncryptionFormProps) {
  const [publicKeyIn, setPublicKeyIn] = useState(defaultPublicKey);
  const [messageIn, setMessageIn] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsEncrypting(true);

    try {
      const publicKey = decodeBase64ToUint8Array(publicKeyIn.trim());
      const encryptedPackage: EncryptedPackage = await vgpEncrypt(
        { message: messageIn },
        publicKey,
      );
      const encryptedPackageBase64 = serializeEncryptedPackage(encryptedPackage);
      onEncryptedPackageGenerated(encryptedPackageBase64);
    } finally {
      setIsEncrypting(false);
    }
  }

  return (
    <section id="encryption">
      <h2>Encryption</h2>
      <p>Use the recipient's public key to encrypt a message.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Recipient public key (base64)
          <textarea
            value={publicKeyIn}
            onChange={(event) => setPublicKeyIn(event.target.value)}
            placeholder="Enter recipient public key"
          />
        </label>

        <label>
          Message to encrypt
          <input
            type="text"
            value={messageIn}
            onChange={(event) => setMessageIn(event.target.value)}
            placeholder="Enter a message"
          />
        </label>

        <button type="submit" disabled={isEncrypting || !publicKeyIn || !messageIn}>
          {isEncrypting ? 'Encrypting…' : 'Encrypt Message'}
        </button>
      </form>
    </section>
  );
}
