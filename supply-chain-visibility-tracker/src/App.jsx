import React from 'react'
import './App.css'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import Home from './pages/Home'
import LoginForm from './components/auth/LoginForm'
import ProductList from './components/products/ProductList'
import DataTable from './components/common/DataTable'

function AppContent() {
  const { user, login, logout } = useAuthContext()

  const sampleProducts = [
    { id: 1, name: 'Widget', sku: 'WGT-001' },
    { id: 2, name: 'Gadget', sku: 'GDT-002' },
  ]

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'sku', title: 'SKU' },
  ]

  return (
    <div style={{ padding: 20 }}>
      <Home />

      {!user ? (
        <section style={{ marginTop: 20 }}>
          <h3>Login</h3>
          <LoginForm onLogin={(creds) => login({ email: creds.email, name: creds.email?.split('@')?.[0] })} />
        </section>
      ) : (
        <section style={{ marginTop: 20 }}>
          <div>Signed in as <strong>{user.name || user.email}</strong></div>
          <button onClick={logout}>Logout</button>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h3>Products</h3>
        <ProductList products={sampleProducts} onEdit={(p) => console.log('Edit', p)} />
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Products Table</h3>
        <DataTable columns={columns} data={sampleProducts} />
      </section>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
