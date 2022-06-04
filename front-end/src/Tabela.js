import React from 'react'
import Table from 'react-bootstrap/Table'
import Estrela from './Estrela'

export default function Tabela({estrelas}) {
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
      {estrelas.map(estrela=>{
        return <Estrela key={estrela.user.id} estrela={estrela} />
      })}
    </tbody>
  </Table>
  )
}
