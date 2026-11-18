import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearToken, getToken, setToken } from '../api'

// Context lets any component read the logged-in user without passing props down.
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // If a token is saved we must check it before deciding who the user is.
  const [loading, setLoading] = useState(() => !!getToken())

  useEffect(() => {
    if (!getToken()) return
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // api.js fires this event when the server says the token expired.
  useEffect(() => {
    const out = () => setUser(null)
    window.addEventListener('auth:logout', out)
    return () => window.removeEventListener('auth:logout', out)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password })
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await api.register({ name, email, password })
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
