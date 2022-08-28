import type { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Formulario } from '../components/Formulario';
import { Tabela } from '../components/Tabela';

import { Estrela } from '../types';

const Home: NextPage = () => {
  const [running, setRunning] = useState<boolean>(false);
  const [estrelas, setEstrelas] = useState<Estrela[]>([]);

  const runningRef = useRef<boolean>(running);

  const onSubmit = async function (token: string, name: string) {
    setRunning((runningRef.current = true));

    const { ProxyService } = await import('../lib/services/ProxyService');

    const service = new ProxyService(token);
    const repo = await service.find(name);
    if (!repo) return alert('Repositório não encontrado.');

    let _estrelas: Estrela[] = [];
    const iterator = service.stargazers(repo.id);

    while (iterator.hasNext()) {
      const { done, value } = await iterator.next();
      setEstrelas((_estrelas = _estrelas.concat(value).reverse()));
      if (done || !runningRef.current) break;
    }

    setRunning((runningRef.current = false));
  };

  return (
    <Container className="App">
      <Formulario
        enableCancel={running}
        enableSubmit={!running}
        onSubmit={onSubmit}
        onCancel={() => setRunning((runningRef.current = false))}
      />
      <br />
      <Tabela estrelas={estrelas} />
    </Container>
  );
};

export default Home;
