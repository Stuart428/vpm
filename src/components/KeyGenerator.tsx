import { useState } from 'react';
import { encodeBase64 } from '../utils/cryptoUtils';
import { vgpGenerateKeyPair } from '../utils/cryptoUtils';

type KeyGeneratorProps = {
  onKeyPairGenerated: (publicKey: string, secretKey: string) => void;
};

export default function KeyGenerator({ onKeyPairGenerated }: KeyGeneratorProps) {
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const keyPair = await vgpGenerateKeyPair();
      const publicKeyBase64 = encodeBase64(keyPair.publicKey);
      const secretKeyBase64 = encodeBase64(keyPair.secretKey);
      setPublicKey(publicKeyBase64);
      setSecretKey(secretKeyBase64);
      onKeyPairGenerated(publicKeyBase64, secretKeyBase64);
    } finally {
      setIsGenerating(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <section id="keyGen">
      <h2>Key Pair Generation</h2>
      <p>
        Generate a new key pair and keep your secret key private. Share only your public key with the person you want to encrypt data for.
      </p>
      <div className="button-group">
        <button type="button" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Generate Key Pair'}
        </button>
      </div>

      <div className="output-block">
        <h3>Public Key</h3>
        <textarea readOnly value={publicKey} />
        <button type="button" className="copy-button" onClick={() => copyText(publicKey)}>
          Copy public key
        </button>
      </div>

      <div className="output-block">
        <h3>Secret Key</h3>
        <textarea readOnly value={secretKey} />
        <button type="button" className="copy-button" onClick={() => copyText(secretKey)}>
          Copy secret key
        </button>
      </div>
    </section>
  );
}
