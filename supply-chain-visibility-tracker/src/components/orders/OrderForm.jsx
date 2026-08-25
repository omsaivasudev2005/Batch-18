import React, { useState } from 'react'

export default function OrderForm({ initial = {}, onSave }) {
  const [customer, setCustomer] = useState(initial.customer || '')

  const submit = (e) => {
    e.preventDefault()
    onSave?.({ customer })
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Customer</label>
        <input value={customer} onChange={(e) => setCustomer(e.target.value)} />
      </div>
      <button type="submit">Create Order</button>
    </form>
  )
}
