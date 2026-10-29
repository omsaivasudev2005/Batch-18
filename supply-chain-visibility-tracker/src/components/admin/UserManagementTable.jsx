const userRoles = [
  'Admin',
  'Product manufacturer',
  'Warehouse manager',
  'Retailer',
]

export default function UserManagementTable({
  users,
  emptyMessage,
  onRoleChange,
  onStatusChange,
}) {
  return (
    <div className="admin-table-scroll">
      <table className="admin-user-table">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">User type</th>
            <th scope="col">Date added</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="admin-user-identity">
                  <span className="admin-user-avatar" aria-hidden="true">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </div>
              </td>
              <td>
                <label className="visually-hidden" htmlFor={`role-${user.id}`}>User type for {user.name}</label>
                <select
                  className="admin-role-select"
                  id={`role-${user.id}`}
                  value={user.role}
                  onChange={(event) => onRoleChange(user.id, event.target.value)}
                >
                  {userRoles.map((role) => <option key={role}>{role}</option>)}
                </select>
              </td>
              <td>{user.createdAt}</td>
              <td><span className={`admin-status ${user.status.toLowerCase()}`}>{user.status}</span></td>
              <td>
                <button
                  className="admin-row-action"
                  onClick={() => onStatusChange(user.id, user.status === 'Active' ? 'Suspended' : 'Active')}
                  aria-label={`${user.status === 'Active' ? 'Suspend' : 'Activate'} ${user.name}`}
                >
                  {user.status === 'Active' ? 'Suspend' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td className="admin-empty-state" colSpan={5}>
                <span className="admin-empty-icon" aria-hidden="true">♙</span>
                <strong>{emptyMessage}</strong>
                <span>Add users to begin monitoring workspace access.</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
