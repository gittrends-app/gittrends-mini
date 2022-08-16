import React from 'react'
import Table from 'react-bootstrap/Table'
import { Estrela } from './App'
import { EstrelaTr } from './EstrelaTr'

export const Tabela: React.FC<{estrelas: Estrela[]}> =({estrelas}) => {
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
      {estrelas.map((estrela)=>{
        return <EstrelaTr key={estrela.user.id} 
        estrela={estrela} />
      })}
    </tbody>
  </Table>
  )
}
