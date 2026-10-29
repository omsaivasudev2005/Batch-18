import { useState } from 'react'
import './App.css'
import AdminDashboard from './components/admin/AdminDashboard'
import RetailerDashboard from './components/retailer/RetailerDashboard'
import WarehouseDashboard from './components/warehouse/WarehouseDashboard'
import { AuthProvider } from './context/AuthContext'
import useAuth from './hooks/useAuth'
import LoginPage from './pages/LoginPage'

const userTypes = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Manage users, settings, and the entire supply chain.',
    icon: '⌘',
    accent: 'purple',
  },
  {
    id: 'manufacturer',
    name: 'Product manufacturer',
    description: 'Oversee production, product quality, and outgoing orders.',
    icon: '⚙',
    accent: 'blue',
  },
  {
    id: 'warehouse',
    name: 'Warehouse manager',
    description: 'Coordinate inventory, shipments, and warehouse operations.',
    icon: '▤',
    accent: 'orange',
  },
  {
    id: 'retailer',
    name: 'Retailer',
    description: 'Track orders, deliveries, and store inventory.',
    icon: '▦',
    accent: 'green',
  },
]

function AppContent() {
  const { user, login, logout } = useAuth()
  const [activeUserType, setActiveUserType] = useState(null)
  const selectedUserType = userTypes.find((type) => type.id === activeUserType)

  function returnToUserTypeSelection() {
    logout()
    setActiveUserType(null)
  }

  if (!selectedUserType) {
    return (
      <main className="selection-page">
        <header className="page-header">
          <a className="brand" href="#" aria-label="Trackline home">
            <span className="brand-mark">t</span>
            <span>trackline<span className="brand-period">.</span></span>
          </a>
          <span className="secure-label"><span aria-hidden="true">●</span> Supply chain workspace</span>
        </header>

        <section className="selection-content" aria-labelledby="selection-title">
          <div className="intro">
            <p className="eyebrow">WELCOME TO TRACKLINE</p>
            <h1 id="selection-title">How will you use Trackline?</h1>
            <p className="intro-description">
              Choose a workspace, then use any email and password to continue.
            </p>
          </div>

          <div className="role-grid" aria-label="Choose a user type">
            {userTypes.map((type) => (
              <button
                className="role-card"
                key={type.id}
                onClick={() => setActiveUserType(type.id)}
              >
                <span className={`role-icon ${type.accent}`} aria-hidden="true">
                  {type.icon}
                </span>
                <span className="role-card-copy">
                  <strong>{type.name}</strong>
                  <span>{type.description}</span>
                </span>
                <span className="role-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="page-footer">
          <span>Trackline <span aria-hidden="true">·</span> Supply chain visibility</span>
          <span>Need help? Contact your workspace administrator.</span>
        </footer>
      </main>
    )
  }

  if (!user) {
    return (
      <LoginPage
        userType={selectedUserType}
        onBack={() => setActiveUserType(null)}
        onLogin={(credentials) => login(credentials, selectedUserType.id)}
      />
    )
  }

  if (selectedUserType.id === 'admin') {
    return (
      <AdminDashboard
        user={user}
        onLogout={returnToUserTypeSelection}
        onChangeUserType={returnToUserTypeSelection}
      />
    )
  }

  if (selectedUserType.id === 'warehouse') {
    return (
      <WarehouseDashboard
        user={user}
        onLogout={returnToUserTypeSelection}
        onChangeUserType={returnToUserTypeSelection}
      />
    )
  }

  if (selectedUserType.id === 'retailer') {
    return (
      <RetailerDashboard
        user={user}
        onLogout={returnToUserTypeSelection}
        onChangeUserType={returnToUserTypeSelection}
      />
    )
  }

  return (
    <main className="welcome-page">
      <div className="welcome-card">
        <a className="brand" href="#" onClick={(event) => {
          event.preventDefault()
          returnToUserTypeSelection()
        }}>
          <span className="brand-mark">t</span>
          <span>trackline<span className="brand-period">.</span></span>
        </a>
        <span className={`role-icon ${selectedUserType.accent}`} aria-hidden="true">
          {selectedUserType.icon}
        </span>
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>{selectedUserType.name}</h1>
        <p className="welcome-description">{selectedUserType.description}</p>
        <p className="signed-in-as">Signed in as {user.name || user.email}</p>
        <div className="welcome-actions">
          <button className="back-button" onClick={returnToUserTypeSelection}>
            ← Change user type
          </button>
          <button className="back-button" onClick={returnToUserTypeSelection}>Sign out</button>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
