import React from 'react'

export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <header>
          <h3>{title}</h3>
          <button onClick={onClose}>Close</button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  )
}
