import { useState, type FormEvent } from 'react';
import {
  decodeBase64ToUint8Array,
  deserializeEncryptedPackage,
  vgpDecrypt,
} from '../utils/cryptoUtils';
import type { EncryptedPackage } from '../types';

type DecryptionFormProps = {
  defaultSecretKey?: string;
};

export default function DecryptionForm({ defaultSecretKey = '' }: DecryptionFormProps) {
  const [encryptedPackageIn, setEncryptedPackageIn] = useState('');
  const [secretKeyIn, setSecretKeyIn] = useState(defaultSecretKey);
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsDecrypting(true);

    try {
      const encryptedPackage: EncryptedPackage = deserializeEncryptedPackage(
        encryptedPackageIn.trim(),
      );
      const secretKey = decodeBase64ToUint8Array(secretKeyIn.trim());
      const result = await vgpDecrypt(encryptedPackage, secretKey);
      setDecryptedMessage(result.message);
    } catch (err) {
      setError('Failed to decrypt the package. Please verify the input values.');
      setDecryptedMessage('');
    } finally {
      setIsDecrypting(false);
    }
  }

  return (
    <section id="decryption">
      <h2>Decryption</h2>
      <p>Paste the encrypted package and your secret key to recover the original message.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Encrypted package (base64)
          <textarea
            value={encryptedPackageIn}
            onChange={(event) => setEncryptedPackageIn(event.target.value)}
            placeholder="Enter encrypted package"
          />
        </label>

        <label>
          Secret key (base64)
          <textarea
            value={secretKeyIn}
            onChange={(event) => setSecretKeyIn(event.target.value)}
            placeholder="Enter your secret key"
          />
        </label>

        <button type="submit" disabled={isDecrypting || !encryptedPackageIn || !secretKeyIn}>
          {isDecrypting ? 'Decrypting…' : 'Decrypt Message'}
        </button>
      </form>

      {decryptedMessage && (
        <div className="result-block">
          <h3>Decrypted message</h3>
          <p>{decryptedMessage}</p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
