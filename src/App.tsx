
import { useState } from 'react';
import './App.css';
import DecryptionForm from './components/DecryptionForm';
import EncryptionForm from './components/EncryptionForm';
import KeyGenerator from './components/KeyGenerator';

function App() {
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [encryptedPackage, setEncryptedPackage] = useState('');

  return (
    <main>
      <header className="app-header">
        <h1>VPM Secure Message Tool</h1>
        <p>
          Generate key pairs, encrypt messages with a recipient's public key, and decrypt packages with your secret key.
        </p>
      </header>

      <KeyGenerator
        onKeyPairGenerated={(publicKeyBase64, secretKeyBase64) => {
          setPublicKey(publicKeyBase64);
          setSecretKey(secretKeyBase64);
        }}
      />

      <EncryptionForm
        defaultPublicKey={publicKey}
        onEncryptedPackageGenerated={setEncryptedPackage}
      />

      <section id="encryptedOutput">
        <h2>Encrypted Output</h2>
        <p className="output-text">
          {encryptedPackage || 'The encrypted package will appear here after encryption.'}
        </p>
        {encryptedPackage && (
          <button
            type="button"
            className="copy-button"
            onClick={() => navigator.clipboard.writeText(encryptedPackage)}
          >
            Copy encrypted package
          </button>
        )}
      </section>

      <DecryptionForm defaultSecretKey={secretKey} />
    </main>
  );
}

export default App;
