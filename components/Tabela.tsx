import React from 'react';
import Table from 'react-bootstrap/Table';

import Stargazer from '../lib/entities/Stargazer';

export const Tabela: React.FC<{ estrelas: Stargazer[] }> = ({ estrelas }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Login</th>
          <th>Name</th>
          <th>Email</th>
          <th>Starred At</th>
        </tr>
      </thead>
      <tbody>
        {estrelas?.map((estrela) => {
          return typeof estrela.user === 'string' ? (
            <tr key={estrela.user}>
              <td colSpan={4}>{estrela.user}</td>
            </tr>
          ) : (
            <tr key={estrela.user.id}>
              <td>{estrela.user.login}</td>
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
