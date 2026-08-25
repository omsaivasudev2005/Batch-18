import React from 'react'

export default function ProductList({ products = [], onEdit }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name} <button onClick={() => onEdit?.(p)}>Edit</button>
        </li>
      ))}
    </ul>
  )
}
