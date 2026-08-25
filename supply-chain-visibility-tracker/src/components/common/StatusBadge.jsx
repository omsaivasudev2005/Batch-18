import React from 'react'

export default function StatusBadge({ status }) {
  const color = status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'gray'
  return <span style={{ color }}>{status}</span>
}
