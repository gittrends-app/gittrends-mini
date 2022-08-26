import React, { useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useState } from 'react';
import { Estrela } from '../types';
import Query from '../lib/github/Query';
import HttpClient from '../lib/github/HttpClient';
import { RepositoryComponent, SearchComponent } from '../lib/github/components';
import { get } from 'lodash';

type Inputs = {
  tokenAuth: string;
  repositoryName: string;
};
interface Props {
  setEstrelas: (event: React.SetStateAction<Estrela[]>) => void;
}
export const Formulario: React.FC<Props> = ({ setEstrelas }) => {
  const [httpClient, setHttpClient] = useState<HttpClient | undefined>();
  const [inputs, setInputs] = useState<Inputs>({
    tokenAuth: '',
    repositoryName: '',
  });

  useEffect(
    () => setHttpClient(new HttpClient(inputs.tokenAuth)),
    [inputs.tokenAuth]
  );

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!httpClient) alert('Access token required!');

    if (httpClient) {
      const repo = await Query.create(httpClient)
        .compose(
          new SearchComponent({ repo: inputs.repositoryName }).setAlias(
            'search'
          )
        )
        .run()
        .then((response) => get(response, ['search', 'nodes', 0]));

      if (!repo) return alert('Repositório não encontrado.');

      const stargazers = await Query.create(httpClient)
        .compose(
          new RepositoryComponent(repo.id)
            .includeDetails(true)
            .includeStargazers(true, { first: 100 })
        )
        .run()
        .then((response) => get(response, 'repository._stargazers.edges'));

      setEstrelas(stargazers);
    }
  };

  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Preencha os campos a seguir</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="tokenAuth">
            <Form.Label>Token GitHub</Form.Label>
            <Form.Control
              type="text"
              placeholder="Token GitHub"
              name="tokenAuth"
              value={inputs.tokenAuth || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="repositoryId">
            <Form.Label>Nome do repositório</Form.Label>
            <Form.Control
              type="string"
              placeholder="twbs/bootstrap"
              name="repositoryName"
              value={inputs.repositoryName || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};
