import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Formulario } from '../components/Formulario';
import { Tabela } from '../components/Tabela';
import { Estrela } from '../types';

const Home: NextPage = () => {
  const [estrelas, setEstrelas] = useState<Estrela[]>([]);
  const LOCAL_STORAGE_KEY_ESTRELAS = 'repository.estrelas';

  useEffect(() => {
    const storedEstrelas = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY_ESTRELAS) as string
    ) as Estrela[];
    if (storedEstrelas) setEstrelas(storedEstrelas);
  }, []);

  useEffect(() => {
    if (estrelas.length > 0) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_ESTRELAS,
        JSON.stringify(estrelas)
      );
    }
  }, [estrelas]);

  return (
    <Container className="App">
      <Formulario setEstrelas={setEstrelas} />
      <br />
      <Tabela estrelas={estrelas} />
    </Container>
  );
};

export default Home;
