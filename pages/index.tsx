import type { NextPage } from 'next';
import { useRef, useState } from 'react';
import { Container } from 'react-bootstrap';

import Stargazer from '../lib/entities/Stargazer';
import { ProxyService } from '../lib/services/ProxyService';

import { Formulario } from '../components/Formulario';
import { Tabela } from '../components/Tabela';

const Home: NextPage = () => {
  const [running, setRunning] = useState<boolean>(false);
  const [estrelas, setEstrelas] = useState<Stargazer[]>([]);

  const runningRef = useRef<boolean>(running);

  const onSubmit = async function (token: string, name: string) {
    const { default: ActorsRepository } = await import('../lib/repos/actors/web.actors.repo');
    const { default: MetadataRepository } = await import('../lib/repos/metadata/web.metadata.repo');
    const { default: RepositoriesRepo } = await import('../lib/repos/repositories/web.repositories.repo');
    const { default: StargazersRepository } = await import('../lib/repos/stargazers/web.stargazers.repo');

    setRunning((runningRef.current = true));
    setEstrelas([]);

    const service = new ProxyService(token, {
      persistence: {
        actors: new ActorsRepository(),
        metadata: new MetadataRepository(),
        repositories: new RepositoriesRepo(),
        stargazers: new StargazersRepository(),
      },
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
