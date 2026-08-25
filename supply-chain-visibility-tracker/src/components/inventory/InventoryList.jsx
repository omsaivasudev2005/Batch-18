import React from 'react'

export default function InventoryList({ items = [] }) {
  return (
    <ul>
      {items.map((it) => (
        <li key={it.id}>{it.productName}: {it.quantity}</li>
      ))}
    </ul>
  )
}
