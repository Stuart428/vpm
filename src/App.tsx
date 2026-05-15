
import { createMlKem1024 } from "mlkem";
import './App.css'

function App() {

  return (
    <>
      
    </>
  )
}

export default App

async function generateMlKemKeyPair() 
{
  const keypair = await createMlKem1024();
  const [pkR, skR] = keypair.generateKeyPair();
  return { pkR, skR };
}

