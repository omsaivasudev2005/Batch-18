import React from 'react'

export default function OrderList({ orders = [], onView }) {
  return (
    <ul>
      {orders.map((o) => (
        <li key={o.id}>{o.reference} - {o.status} <button onClick={() => onView?.(o)}>View</button></li>
      ))}
    </ul>
  )
}
