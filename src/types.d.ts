
type symmetricPackage = {
  message: string;
  filePackage: filePackage[]
};
type symmetricEncryptedDataPackage = {
  cipherText: string;
  initializationVector: Buffer;
  authTag: Buffer;
}
type encryptedPackage = {
  encryptedSymmetricKey: Uint8Array;
  symmetricEncryptedDataPackage: symmetricEncryptedDataPackage;
}

type decryptedPackage = {
  message: string;
  filePackage: filePackage[]
}

type filePackage = 
{
  fileName: string;
  data: string;
}