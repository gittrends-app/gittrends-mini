import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useState } from 'react';

interface Props {
  enableSubmit?: boolean;
  enableCancel?: boolean;
  onSubmit?: (token: string, name: string) => void;
  onCancel?: () => void;
}

export const Formulario: React.FC<Props> = ({
  onSubmit,
  onCancel,
  enableSubmit = true,
  enableCancel = false,
}) => {
  const [inputs, setInputs] = useState({
    tokenAuth: '',
    repositoryName: '',
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (onSubmit) onSubmit(inputs.tokenAuth, inputs.repositoryName);
  };

  const handleReset = async (event: any) => {
    event.preventDefault();
    if (onCancel) onCancel();
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
        <Form onSubmit={handleSubmit} onReset={handleReset}>
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
          <Form.Group className="mb-3" controlId="buttons">
            <Button variant="primary" type="submit" disabled={!enableSubmit}>
              Submit
            </Button>
            <Button
              variant="danger"
              type="reset"
              disabled={!enableCancel}
              className="float-end"
            >
              Cancel
            </Button>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
};
