
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
      <div> 
        <h2>Keygen</h2>
        <button onClick={() => {if (showKeygen == true){setShowKeygen(false);} else {setShowKeygen(true);}}}>Toggle visibility</button>
      </div>
      {showKeygen && <KeyGen />}
      <div> 
        <h2>Encryption</h2>
        <button onClick={() => {if (showEncryption == true){setShowEncryption(false);} else {setShowEncryption(true);}}}>Toggle visibility</button>
      </div>
      {showEncryption && <Encryption />}
      <div> 
        <h2>Decryption</h2>
        <button onClick={() => {if (showDecryption == true){setShowDecryption(false);} else {setShowDecryption(true);}}}>Toggle visibility</button>
      </div>
      {showDecryption && <Decryption />}
    </>
  )
}

export default App

