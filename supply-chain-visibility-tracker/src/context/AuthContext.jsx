import { useState } from 'react'
import { setAccessToken } from '../api/client'
import AuthContext from './auth-context'

const roleDetails = {
  admin: { apiRole: 'ADMIN' },
  manufacturer: {
    apiRole: 'PRODUCT_MANUFACTURER',
  },
  warehouse: {
    apiRole: 'WAREHOUSE_MANAGER',
  },
  retailer: { apiRole: 'RETAILER' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  async function login(credentials, requiredRole) {
    const role = roleDetails[requiredRole]
    if (!role) {
      throw new Error('Choose a valid user type before signing in.')
    }

    const email = credentials.email?.trim()
    if (!email) {
      throw new Error('Enter an email address to continue.')
    }

    setAccessToken(null)
    setUser({
      email,
      role: role.apiRole,
    })
  }

  function logout() {
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
