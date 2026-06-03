
type symmetricPackage = {
  message: string;
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
}

type filePackage = 
{
  fileName: string;
  data: string;
}