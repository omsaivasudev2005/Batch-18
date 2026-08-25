import React from 'react'

export default function OrderApprovalPanel({ order, onApprove, onReject }) {
  if (!order) return null
  return (
    <div>
      <h4>Approve Order {order.reference}</h4>
      <button onClick={() => onApprove?.(order)}>Approve</button>
      <button onClick={() => onReject?.(order)}>Reject</button>
    </div>
  )
}
