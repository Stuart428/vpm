import { useState} from 'react';
import { vgpGenerateKeyPair } from '../cryptoFunctions';
import { Buffer } from 'buffer';
async function onClick(setPublicKeyOut: React.Dispatch<React.SetStateAction<string>>, setSecretKeyOut: React.Dispatch<React.SetStateAction<string>>)
{
    const { publicKey, secretKey } = await vgpGenerateKeyPair();
    console.log(publicKey.length);
    console.log(Buffer.from(publicKey).toString('base64').length);
    setPublicKeyOut(Buffer.from(publicKey).toString('base64'));
    setSecretKeyOut(Buffer.from(secretKey).toString('base64'));
}

function keygen() 
{
    const [publicKeyOut, setPublicKeyOut] = useState<string>('');
    const [secretKeyOut, setSecretKeyOut] = useState<string>('');
    return (
        <div id="keyGen">
            <h2>Key Pair Generation (Remember to write both of these down! You should probably not spend the time manually writing this on a piece of paper and store it in a text file)</h2>
            <button onClick={async () => {await onClick(setPublicKeyOut, setSecretKeyOut);}}>Generate Key Pair </button>
            <h3>Public Key (Send this to anyone who you want to communicate securely with): </h3>
            <p id="keyGenPublicKeyOut">{publicKeyOut}</p>
            <button onClick={() => {navigator.clipboard.writeText(publicKeyOut)}}> Copy</button>
            <h3>Secret Key (Keep this secret and do not share it with anyone): </h3>
            <p id="keyGenSecretKeyOut">{secretKeyOut}</p>
            <button onClick={() => {navigator.clipboard.writeText(secretKeyOut)}}> Copy</button>
      </div>
    )
}
export default keygen;