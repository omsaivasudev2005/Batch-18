import React, { useState } from 'react'

export default function ShipmentStatusUpdater({ shipment, onUpdate }) {
  const [status, setStatus] = useState(shipment?.status || '')

  const submit = (e) => {
    e.preventDefault()
    onUpdate?.({ ...shipment, status })
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Status</label>
        <input value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>
      <button type="submit">Update</button>
    </form>
  )
}
