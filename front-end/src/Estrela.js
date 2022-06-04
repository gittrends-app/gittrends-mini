import React from 'react'
import Image from 'react-bootstrap/Image'

export default function Estrela({estrela}) {
  return (
    <tr>
      <td><Image fluid={true} rounded={true} width={50} height={50} src={estrela.user.avatar_url} /></td>
      <td>{estrela.user.name}</td>
      <td>{estrela.user.email}</td>
      <td>{estrela.starred_at}</td>
    </tr>
  )
}
