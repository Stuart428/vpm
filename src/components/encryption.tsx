import './encryption.css'
import { useState} from 'react';
import { vgpEncrypt } from '../cryptoFunctions';
import { Buffer } from 'buffer';
async function onSumbit(e: React.FormEvent<HTMLFormElement>, publicKeyIn: string, messageIn: string, setEncryptedPackageOut: React.Dispatch<React.SetStateAction<string>>, files: filePackage[]) 
{
    e.preventDefault();
    const publicKey = new Uint8Array(
        Buffer.from(publicKeyIn, 'base64')
    );
    console.log("publicKey length:", publicKey.length);
    console.log(publicKey);
    console.log("publicKey length:", publicKeyIn.length);
    console.log(publicKeyIn);
    const message = messageIn;
    const symetricPackage : symmetricPackage = {message: message, filePackage: files };
    //alert(JSON.stringify(symetricPackage));
    const encryptedPackage : encryptedPackage = await vgpEncrypt(symetricPackage, publicKey);
    const safePackage = {
        encryptedSymmetricKey: Buffer.from(encryptedPackage.encryptedSymmetricKey).toString("base64"),
        symmetricEncryptedDataPackage: {
            cipherText: encryptedPackage.symmetricEncryptedDataPackage.cipherText,
            initializationVector: Buffer.from(encryptedPackage.symmetricEncryptedDataPackage.initializationVector).toString("base64"),
            authTag: Buffer.from(encryptedPackage.symmetricEncryptedDataPackage.authTag).toString("base64"),
        }
    };
    const base64 = Buffer.from(JSON.stringify(safePackage)).toString("base64");
    setEncryptedPackageOut(base64);
    console.log(base64); 
}

function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<filePackage[]>>)
{
    var files: filePackage[] = [];
    if (e.target.files) {
      for (let x = 0; x < e.target.files.length; x++)
      {
        const file = e.target.files?.[x];

        const reader = new FileReader();

        reader.onloadend = () => {
            const base64String = (reader.result as string)
                .replace('data:', '')
                .replace(/^.+,/, '');

            const newFile: filePackage = {
                fileName: file.name,
                data: base64String
            };

            console.log(newFile);
            files.push(newFile);
        };

        reader.readAsDataURL(file);
      }
    }
    setFiles(files);
    return files;
}

function Encryption() {
  const [publicKeyIn, setPublicKeyIn] = useState<string>('');
  const [messageIn, setMessageIn] = useState<string>('');
  const [encryptedPackageOut, setEncryptedPackageOut] = useState<string>('');
  const [files, setFiles] = useState<filePackage[]>([]);

  return (
    <div id="encryption">
        <h2>Encryption</h2>
        <p>To encrypt a message, you will need the recipient's public key. You can use the public key generated in the previous section or any other valid public key.</p>
        <p>Enter the message you want to encrypt and the recipient's public key (in base64 format) below:</p>
        <form onSubmit={(e) => onSumbit(e, publicKeyIn, messageIn, setEncryptedPackageOut, files)}>
        <textarea
            value={publicKeyIn}
            onChange={(event) => setPublicKeyIn(event.target.value)}
            placeholder="Enter public key here"
            rows={10}
            cols={100}
        />
        <textarea 
        value={messageIn} 
        onChange={(event) => setMessageIn(event.target.value)} 
        placeholder="Enter message here"
        rows={10}
        cols={100}
        />
        <input id="file" type="file" onChange={(e)=> {handleFileChange(e, setFiles)}} />
        
        <input type="submit" ></input>
        
        </form>
        
        <h3>The encrypted message: </h3>
        
        <p>{encryptedPackageOut}</p>
        
        <button
onClick={() => {navigator.clipboard.writeText(encryptedPackageOut)}}> Copy</button>

    </div>
)}
export default Encryption;