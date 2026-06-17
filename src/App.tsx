
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
      <div> <button onClick={() => {if (showKeygen == true){setShowKeygen(false);} else {setShowKeygen(true);}}}>Toggle visibility</button></div>
      {showKeygen && <KeyGen />}
      <div> <button onClick={() => {if (showEncryption == true){setShowEncryption(false);} else {setShowEncryption(true);}}}>Toggle visibility</button></div>
      {showEncryption && <Encryption />}
      <div> <button onClick={() => {if (showDecryption == true){setShowDecryption(false);} else {setShowDecryption(true);}}}>Toggle visibility</button></div>
      {showDecryption && <Decryption />}
    </>
  )
}

export default App

