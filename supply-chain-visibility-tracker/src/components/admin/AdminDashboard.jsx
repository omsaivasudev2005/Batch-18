import { useMemo, useState } from 'react'
import UserManagementTable from './UserManagementTable'

const userRoles = [
  'Admin',
  'Product manufacturer',
  'Warehouse manager',
  'Retailer',
]

const statusFilters = ['All users', 'Active', 'Pending', 'Suspended']

export default function AdminDashboard({ user, onChangeUserType, onLogout }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All roles')
  const [statusFilter, setStatusFilter] = useState('All users')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch = `${user.name} ${user.email}`.toLowerCase().includes(query)
      const matchesRole = roleFilter === 'All roles' || user.role === roleFilter
      const matchesStatus = statusFilter === 'All users' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const counts = {
    total: users.length,
    active: users.filter((user) => user.status === 'Active').length,
    pending: users.filter((user) => user.status === 'Pending').length,
    suspended: users.filter((user) => user.status === 'Suspended').length,
  }

  function addUser(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name')).trim()
    const email = String(formData.get('email')).trim()
    const role = String(formData.get('role'))
    const existingUser = users.some((user) => user.email.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      setFormError('A user with this email address already exists.')
      return
    }

    form.reset()
    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: crypto.randomUUID(),
        name,
        email,
        role,
        status: 'Pending',
        createdAt: new Date().toLocaleDateString(),
      },
    ])
    setFormError('')
    setIsFormOpen(false)
    setNotice('User added with pending status.')
  }

  function updateUserStatus(userId, status) {
    setUsers((currentUsers) =>
      currentUsers.map((user) => user.id === userId ? { ...user, status } : user),
    )
  }

  function updateUserRole(userId, role) {
    setUsers((currentUsers) =>
      currentUsers.map((user) => user.id === userId ? { ...user, role } : user),
    )
  }

  function closeForm() {
    setIsFormOpen(false)
    setFormError('')
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <a className="brand" href="#" onClick={(event) => {
          event.preventDefault()
          onChangeUserType()
        }}>
          <span className="brand-mark">t</span>
          <span>trackline<span className="brand-period">.</span></span>
        </a>
        <div className="admin-topbar-actions">
          <span className="admin-viewer">
            <span>{(user.name || user.email).slice(0, 2).toUpperCase()}</span>
            {user.name || user.email}
          </span>
          <button className="admin-back-button" onClick={onChangeUserType}>Change user type</button>
          <button className="admin-back-button" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        <section className="admin-heading">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>User management</h1>
            <p className="admin-subtitle">Monitor workspace access and manage supply chain users.</p>
          </div>
          <button className="admin-primary-button" onClick={() => {
            setNotice('')
            setIsFormOpen(true)
          }}>
            <span aria-hidden="true">＋</span> Add user
          </button>
        </section>

        <p className="admin-storage-note">
          Prototype only: changes are temporary; there is no server, invitation delivery, or admin access control.
        </p>

        <section className="admin-stats" aria-label="User summary">
          <article className="admin-stat-card">
            <span className="admin-stat-icon purple" aria-hidden="true">♙</span>
            <div><p>Total users</p><strong>{counts.total}</strong></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon green" aria-hidden="true">✓</span>
            <div><p>Active users</p><strong>{counts.active}</strong></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon orange" aria-hidden="true">◷</span>
            <div><p>Pending users</p><strong>{counts.pending}</strong></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon gray" aria-hidden="true">⊘</span>
            <div><p>Suspended</p><strong>{counts.suspended}</strong></div>
          </article>
        </section>

        <section className="admin-users-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Workspace users</h2>
              <p>Review user roles and access status.</p>
            </div>
            <span className="admin-user-count">{counts.total} {counts.total === 1 ? 'user' : 'users'}</span>
          </div>

          <div className="admin-toolbar">
            <label className="admin-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search users"
              />
            </label>
            <label className="admin-filter">
              <span className="visually-hidden">Filter by role</span>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option>All roles</option>
                {userRoles.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <div className="admin-status-filters" aria-label="Filter by status">
              {statusFilters.map((status) => (
                <button
                  className={statusFilter === status ? 'selected' : ''}
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  aria-pressed={statusFilter === status}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <UserManagementTable
            users={visibleUsers}
            emptyMessage={users.length === 0 && !search && roleFilter === 'All roles' && statusFilter === 'All users'
              ? 'No users have been added yet.'
              : 'No users match these filters.'}
            onRoleChange={updateUserRole}
            onStatusChange={updateUserStatus}
          />
        </section>

        {isFormOpen && (
          <div className="admin-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}>
            <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="add-user-title">
              <div className="admin-modal-heading">
                <div>
                  <p className="admin-eyebrow">WORKSPACE ACCESS</p>
                  <h2 id="add-user-title">Add a user</h2>
                </div>
                <button className="admin-close-button" onClick={closeForm} aria-label="Close">×</button>
              </div>
              <p className="admin-modal-description">Add a user to the workspace. They will appear as pending until activated.</p>
              <form className="admin-user-form" onSubmit={addUser}>
                <label>
                  Full name
                  <input name="name" type="text" autoComplete="name" required maxLength={100} />
                </label>
                <label>
                  Email address
                  <input name="email" type="email" autoComplete="email" required maxLength={254} />
                </label>
                <label>
                  User type
                  <select name="role" required defaultValue="">
                    <option value="" disabled>Select a user type</option>
                    {userRoles.map((role) => <option key={role}>{role}</option>)}
                  </select>
                </label>
                {formError && <p className="admin-form-error" role="alert">{formError}</p>}
                <div className="admin-form-actions">
                  <button className="admin-secondary-button" type="button" onClick={closeForm}>Cancel</button>
                  <button className="admin-primary-button" type="submit">Add user</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {notice && <div className="admin-toast" role="status">{notice}</div>}
      </div>
    </main>
  )
}
