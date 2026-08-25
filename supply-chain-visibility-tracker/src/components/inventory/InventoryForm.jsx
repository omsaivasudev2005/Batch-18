import React, { useState } from 'react'

export default function InventoryForm({ initial = {}, onSave }) {
  const [quantity, setQuantity] = useState(initial.quantity || 0)

  const submit = (e) => {
    e.preventDefault()
    onSave?.({ quantity })
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Quantity</label>
        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>
      <button type="submit">Save</button>
    </form>
  )
}
