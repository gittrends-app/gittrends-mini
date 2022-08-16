import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { useState } from "react";
import { Estrela } from './App';
import { QueryFunction } from './dist/QueryFunction';

type Inputs = {
    tokenAuth: string;
    repositoryId: string;
}
interface Props {
    setEstrelas: (event: React.SetStateAction<Estrela[]>) => void;
}
export const Formulario: React.FC<Props> = ({ setEstrelas }) => {
    const [inputs, setInputs] = useState<Inputs>({ tokenAuth: '', repositoryId: '' });

    const handleSubmit = (event: any) => {
        event.preventDefault();
        var queryFunction = new QueryFunction(inputs.tokenAuth, inputs.repositoryId);

        queryFunction.runQuery()
            .then(
                (result) => {
                    console.log(result);
                    if (result.repository) {
                        setEstrelas(result.repository._stargazers.edges
                        );
                    }
                },
                (error) => {
                    alert(error)
                }
            )
    }
    const handleChange = (event: any) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }))
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title>Preencha os campos a seguir</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="tokenAuth">
                        <Form.Label>Token GitHub</Form.Label>
                        <Form.Control type="text" placeholder="Token GitHub" name='tokenAuth'
                            value={inputs.tokenAuth || ""}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="repositoryId">
                        <Form.Label>ID do repositório</Form.Label>
                        <Form.Control type="string" placeholder="ID do repositório" name='repositoryId'
                            value={inputs.repositoryId || ""}
                            onChange={handleChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    )
}
