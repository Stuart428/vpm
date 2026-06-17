
import './App.css'
import Encryption from './components/encryption';
import KeyGen from './components/keygen';
import Decryption from './components/decryption';
import { useState } from 'react';
function App() {
  const [showKeygen, setShowKeygen] = useState(true)
  const [showEncryption, setShowEncryption] = useState(true)
  const [showDecryption, setShowDecryption] = useState(true)

  
  

  return (
    <>
      {showKeygen && <KeyGen />}
      {showEncryption && <Encryption />}
      {showDecryption && <Decryption />}
    </>
  )
}

export default App

