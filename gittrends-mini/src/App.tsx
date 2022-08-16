import { useState, useEffect } from "react";
import { Formulario } from "./Formulario";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container'
import { Tabela } from "./Tabela";

export interface Estrela{
  starred_at: Date;
  user:{
    avatar_url: string;
    created_at: Date;
    database_id: number;
    email: string;
    id: string;
    location: string;
    login: string;
    name: string;
    twitter_username: string;
    type: string;
    updated_at: Date;
    website_url: string;
  }
}
function App() {
  const [estrelas, setEstrelas] = useState<Estrela[]>([])
  const LOCAL_STORAGE_KEY_ESTRELAS = 'repository.estrelas'

  useEffect(()=>{
    const storedEstrelas = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ESTRELAS) as string) as Estrela[]
    if(storedEstrelas) setEstrelas(storedEstrelas)
  }, [])
  useEffect(() =>{
    if(estrelas.length > 0){
    localStorage.setItem(LOCAL_STORAGE_KEY_ESTRELAS, JSON.stringify(estrelas))
    }
  }, [estrelas])

  return (
    <Container className="App">
      <Formulario setEstrelas={setEstrelas}/>
      <br/>
      <Tabela  estrelas={estrelas} />
    </Container>
  );
}

export default App;
