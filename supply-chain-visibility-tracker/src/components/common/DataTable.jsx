import React from 'react'

export default function DataTable({ columns = [], data = [] }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key || c}>{c.title || c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.key || c}>{row[c.key || c] ?? ''}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
