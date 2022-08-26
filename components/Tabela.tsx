import React from 'react';
import Table from 'react-bootstrap/Table';
import { Estrela } from '../types';
import Image from 'react-bootstrap/Image';

export const Tabela: React.FC<{ estrelas: Estrela[] }> = ({ estrelas }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Picture</th>
          <th>Name</th>
          <th>Email</th>
          <th>Starred At</th>
        </tr>
      </thead>
      <tbody>
        {estrelas?.map((estrela) => {
          return (
            <tr key={estrela.user.id}>
              <td>
                <Image
                  fluid={true}
                  rounded={true}
                  width={50}
                  height={50}
                  src={estrela.user.avatar_url}
                  alt="User avatar"
                />
              </td>
              <td>{estrela.user.name}</td>
              <td>{estrela.user.email}</td>
              <td>{new Date(estrela.starred_at).toISOString()}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
