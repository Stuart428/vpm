
import './decryption.css'
import React, { useState} from 'react';
import { Buffer } from 'buffer';
import { vgpDecrypt } from '../cryptoFunctions';
//todo: make ze file download
async function onSubmit(e: React.FormEvent<HTMLFormElement>, encryptedPackageIn: string, secretKeyIn: string, setMessageOut: React.Dispatch<React.SetStateAction<string>>, setDecryptedPackage: React.Dispatch<React.SetStateAction<decryptedPackage | null>>): Promise<decryptedPackage>
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
        //alert(JSON.stringify(decryptedPackage));
        setMessageOut(decryptedPackage.message);
        //setMessageOut(JSON.stringify(decryptedPackage));
        alert("Decrypted message: " + decryptedPackage.message);
        setDecryptedPackage(decryptedPackage);
        return decryptedPackage;
    }
    catch (error)
    {
      alert(error);
      //alert(encryptedPackageIn);
      throw error;
    }
}
async function downloadFile(decryptedPackage: decryptedPackage) {
    try {
        console.log("decryptedPackage", decryptedPackage);

        if (!decryptedPackage) {
            throw new Error("decryptedPackage is undefined");
        }

        if (!decryptedPackage.filePackage?.length) {
            throw new Error("filePackage is empty or undefined");
        }

        const fileThing = decryptedPackage.filePackage[0];

        console.log("fileThing", fileThing);

        if (!fileThing.data) {
            throw new Error("fileThing.data is undefined");
        }

        const response = await fetch(fileThing.data);
        const blob = await response.blob();

        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = fileThing.fileName ?? "download";

        document.body.appendChild(element);
        element.click();
        element.remove();

    } catch (error) {
        console.error(error);
        alert(error);
    }
}
function decryption() {
    const [encryptedPackageIn, setEncryptedPackageIn] = useState<string>('');
    const [secretKeyIn, setSecretKeyIn] = useState<string>('');
    const [messageOut, setMessageOut] = useState<string>('');
    const [decryptedPackage, setDecryptedPackage] =
    useState<decryptedPackage | null>(null);

    return (
        <div id="decryption">
            <h2>Decryption</h2>
            <p>To decrypt a message, you will need the encrypted package (the output from the encryption section) and the secret key corresponding to the public key used for encryption.</p>
            <p>Enter the encrypted package (in base64 format) and your secret key (in base64 format) below:</p>
            <form onSubmit={async (e) => {await onSubmit(e, encryptedPackageIn, secretKeyIn, setMessageOut, setDecryptedPackage);}}>
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
        <button disabled={!decryptedPackage} id="downloadButton" value="download" onClick={async () => {if (decryptedPackage){ await downloadFile(decryptedPackage)}}}>Download File</button>
    </div>
     
    )
}

export default decryption;