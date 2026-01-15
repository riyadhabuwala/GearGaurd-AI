import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { http } from '../../api/http'
import { clearAuth, getToken, getUser, normalizeRole, setToken, setUser } from '../../utils/authStorage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser())
  const [token, setTokenState] = useState(() => getToken())
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    setUserState(getUser())
    setTokenState(getToken())
    setIsHydrating(false)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const res = await http.post('/api/auth/login', { email, password })

    const nextToken = res?.data?.token
    const nextUser = res?.data?.user

    setToken(nextToken)
    setUser(nextUser)

    setTokenState(nextToken)
    setUserState(nextUser)

    return { token: nextToken, user: nextUser }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUserState(null)
    setTokenState(null)
  }, [])

  const isAuthenticated = !!token && !!user
  const role = normalizeRole(user?.role)

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated,
      isHydrating,
      login,
      logout,
    }),
    [user, token, role, isAuthenticated, isHydrating, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
