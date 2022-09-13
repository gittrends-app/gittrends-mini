import type { NextPage } from 'next';
import { useRef, useState } from 'react';
import { Container } from 'react-bootstrap';

import { Stargazer } from '@gittrends/lib';
import { ProxyService } from '@gittrends/lib';

import { Formulario } from '../components/Formulario';
import { Tabela } from '../components/Tabela';

const Home: NextPage = () => {
  const [running, setRunning] = useState<boolean>(false);
  const [estrelas, setEstrelas] = useState<Stargazer[]>([]);

  const runningRef = useRef<boolean>(running);

  const onSubmit = async function (token: string, name: string) {
    const { default: ActorsRepository } = await import('../lib/ActorsRepository');
    const { default: MetadataRepository } = await import('../lib/MetadataRepository');
    const { default: RepositoriesRepo } = await import('../lib/RepositoriesRepository');
    const { default: StargazersRepository } = await import('../lib/StargazersRepository');

    setRunning((runningRef.current = true));
    setEstrelas([]);

    const service = new ProxyService(token, {
      actors: new ActorsRepository(),
      metadata: new MetadataRepository(),
      repositories: new RepositoriesRepo(),
      stargazers: new StargazersRepository(),
    });

    const repo = await service.find(name);
    if (!repo) return alert('Repositório não encontrado.');

    const stargazers: Stargazer[] = [];
    const iterator = service.stargazers(repo.id);

    while (true) {
      const { done, value } = await iterator.next();
      if (value) {
        stargazers.push(...value);
        setEstrelas(stargazers);
      }
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