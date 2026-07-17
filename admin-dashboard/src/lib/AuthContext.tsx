import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextType {
  isAuth: boolean
  login: (pass: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem('admin_auth') === 'true')

  const login = (pass: string) => {
    const ok = pass === 'alshifa123'
    if (ok) {
      setIsAuth(true)
      localStorage.setItem('admin_auth', 'true')
    }
    return ok
  }

  const logout = () => {
    setIsAuth(false)
    localStorage.removeItem('admin_auth')
  }

  return <AuthContext.Provider value={{ isAuth, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
