import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import Dashboard from '@/pages/Dashboard'
import AnalyticsPage from '@/pages/Analytics'
import OrdersPage from '@/pages/Orders'
import WhatsAppCRM from '@/pages/WhatsAppCRM'

const queryClient = new QueryClient()

// ── Login Page ──
function LoginPage() {
  const { isAuth, login } = useAuth()
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErr('')
    if (login(pass)) {
      window.location.reload()
    } else {
      setErr('Invalid password')
      setLoading(false)
    }
  }

  if (isAuth) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-3xl border border-gray-200 shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0f3d2e] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#caa64b] font-bold text-xl">SH</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Al Shifa Herb</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Password</label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Enter admin password"
            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#caa64b]/30"
            autoComplete="current-password"
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>

        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#0f3d2e] text-white font-semibold text-sm hover:bg-[#0a2d22] transition-colors cursor-pointer disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

// ── Protected Layout ──
function ProtectedLayout() {
  const { isAuth } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  if (!isAuth) return <Navigate to="/login" replace />

  return (
    <ErrorBoundary>
      <div className={dark ? 'dark bg-gray-950 min-h-screen' : 'bg-gray-50/50 min-h-screen'}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ marginLeft: collapsed ? 72 : 260 }} className="transition-all duration-300 min-h-screen">
          <TopBar dark={dark} setDark={setDark} />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/whatsapp" element={<WhatsAppCRM />} />
              <Route path="*" element={
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coming Soon</h2>
                    <p className="text-gray-400 mt-2">This feature is under development</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// ── App ──
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
