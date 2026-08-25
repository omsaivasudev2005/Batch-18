import React, { useState } from 'react'

export default function ProductForm({ initial = {}, onSave }) {
  const [name, setName] = useState(initial.name || '')
  const [sku, setSku] = useState(initial.sku || '')

  const submit = (e) => {
    e.preventDefault()
    onSave?.({ name, sku })
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>SKU</label>
        <input value={sku} onChange={(e) => setSku(e.target.value)} />
      </div>
      <button type="submit">Save</button>
    </form>
  )
}
