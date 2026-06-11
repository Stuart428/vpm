
import './decryption.css'
import React, { useState} from 'react';
import { Buffer } from 'buffer';
import { vgpDecrypt } from '../cryptoFunctions';
//todo: make ze file download
async function onSubmit(e: React.FormEvent<HTMLFormElement>, encryptedPackageIn: string, secretKeyIn: string, setMessageOut: React.Dispatch<React.SetStateAction<string>>)
{
    try 
    {
        e.preventDefault();
        const secretKey = new Uint8Array(
            Buffer.from(secretKeyIn, 'base64')
        );
        console.log("secretKey length:", secretKey.length);
        console.log(secretKey);
        console.log("secretKey length:", secretKeyIn.length);
        console.log(secretKeyIn);
        const encryptedPackageJson = Buffer.from(encryptedPackageIn, 'base64').toString('utf-8');
        const parsed = JSON.parse(encryptedPackageJson);

        const encryptedPackage: encryptedPackage = {
            encryptedSymmetricKey: new Uint8Array(Buffer.from(parsed.encryptedSymmetricKey, "base64")),
            symmetricEncryptedDataPackage: {
                cipherText: parsed.symmetricEncryptedDataPackage.cipherText,
                initializationVector: Buffer.from(parsed.symmetricEncryptedDataPackage.initializationVector, "base64"),
            authTag: Buffer.from(parsed.symmetricEncryptedDataPackage.authTag, "base64"),
            }
        };

        const decryptedPackage : decryptedPackage = await vgpDecrypt(encryptedPackage, secretKey);
        alert(JSON.stringify(decryptedPackage));
        setMessageOut(decryptedPackage.message);
        alert("Decrypted message: " + decryptedPackage.message);
    }
    catch (error)
    {
      alert(error);
      //alert(encryptedPackageIn);
    }
}

function decryption() {
    const [encryptedPackageIn, setEncryptedPackageIn] = useState<string>('');
    const [secretKeyIn, setSecretKeyIn] = useState<string>('');
    const [messageOut, setMessageOut] = useState<string>('');

    return (
        <div id="decryption">
            <h2>Decryption</h2>
            <p>To decrypt a message, you will need the encrypted package (the output from the encryption section) and the secret key corresponding to the public key used for encryption.</p>
            <p>Enter the encrypted package (in base64 format) and your secret key (in base64 format) below:</p>
            <form onSubmit={async (e) => {await onSubmit(e, encryptedPackageIn, secretKeyIn, setMessageOut);}}>
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
                <input type="submit" ></input>
        </form>
        <h3>Decrypted message:</h3>
        <p>{messageOut}</p>
        <button onClick={() => {navigator.clipboard.writeText(messageOut)}}> Copy</button>
    </div>
     
    )
}

export default decryption;