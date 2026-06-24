
import './App.css'
import Encryption from './components/encryption';
import KeyGen from './components/keygen';
import Decryption from './components/decryption';
import MaterialIcon from './MaterialIcon';
import { useState } from 'react';
function App() {
  const [showKeygen, setShowKeygen] = useState(true)
  const [showEncryption, setShowEncryption] = useState(true)
  const [showDecryption, setShowDecryption] = useState(true)

  
  

  return (
    <>
      <div id="titleBar">
        <img src="/public/logo.svg" alt="Logo" />
        <h1>VPM - A simple web-based PGP like application</h1>
      </div>
      <div id="keygenTab"> 
        <h2>Keygen</h2>
        <button onClick={() => {if (showKeygen == true){setShowKeygen(false);} else {setShowKeygen(true);}}}>
          <MaterialIcon name={showKeygen ? "arrow_upward" : "arrow_downward"} />
        </button>
      </div>
      {showKeygen && <KeyGen />}
      <div id="encryptionTab"> 
        <h2>Encryption</h2>
        <button onClick={() => {if (showEncryption == true){setShowEncryption(false);} else {setShowEncryption(true);}}}>
          <MaterialIcon name={showEncryption ? "arrow_upward" : "arrow_downward"} />
        </button>
      </div>
      {showEncryption && <Encryption />}
      <div id="decryptionTab"> 
        <h2>Decryption</h2>
        <button onClick={() => {if (showDecryption == true){setShowDecryption(false);} else {setShowDecryption(true);}}}>
          <MaterialIcon name={showDecryption ? "arrow_upward" : "arrow_downward"} />
        </button>
      </div>
      {showDecryption && <Decryption />}
    </>
  )
}

export default App

