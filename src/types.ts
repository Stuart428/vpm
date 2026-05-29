export type SymmetricPackage = {
  message: string;
};

export type SymmetricEncryptedDataPackage = {
  cipherText: string;
  initializationVector: Buffer;
  authTag: Buffer;
};

export type EncryptedPackage = {
  encryptedSymmetricKey: Uint8Array;
  symmetricEncryptedDataPackage: SymmetricEncryptedDataPackage;
};

export type DecryptedPackage = {
  message: string;
};
