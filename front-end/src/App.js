import { useState, useEffect } from "react";
import Formulario from "./Formulario";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container'
import Tabela from "./Tabela";

function App() {
  const [estrelas, setEstrelas] = useState([])
  const LOCAL_STORAGE_KEY_ESTRELAS = 'repository.estrelas'

  useEffect(()=>{
    const storedEstrelas = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ESTRELAS))
    if(storedEstrelas) setEstrelas(storedEstrelas)
  }, [])
  useEffect(() =>{
    localStorage.setItem(LOCAL_STORAGE_KEY_ESTRELAS, JSON.stringify(estrelas))
  }, [estrelas])

  return (
    <Container className="App">
      <Formulario setEstrelas={setEstrelas}/>
      <br/>
      <Tabela estrelas={estrelas} />
    </Container>
  );
}

export default App;
