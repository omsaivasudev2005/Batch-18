import React from 'react'

export default function UserManagementTable({ users = [] }) {
  return (
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th></tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}><td>{u.name}</td><td>{u.email}</td></tr>
        ))}
      </tbody>
    </table>
  )
}
