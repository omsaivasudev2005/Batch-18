import React from 'react'

export default function ShipmentTracker({ shipments = [] }) {
  return (
    <ul>
      {shipments.map((s) => (
        <li key={s.id}>{s.trackingNumber} - {s.status}</li>
      ))}
    </ul>
  )
}
