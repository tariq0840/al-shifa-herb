import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('admin_auth') === 'true')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErr('')
    if (pass === 'alshifa123') {
      localStorage.setItem('admin_auth', 'true')
      window.location.reload()
    } else {
      setErr('Invalid password')
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_auth')
    window.location.reload()
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <form onSubmit={login} style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 24, border: '1px solid #e5e7eb', padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#0f3d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ color: '#caa64b', fontWeight: 'bold', fontSize: 22 }}>SH</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Al Shifa Herb</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>Admin Dashboard</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Enter admin password"
              style={{ width: '100%', height: 48, padding: '0 16px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#caa64b'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              autoComplete="current-password"
            />
            {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{err}</p>}
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', height: 48, borderRadius: 12, background: '#0f3d2e', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#0f1117' : '#f8f9fc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: dark ? '#1a1d26' : 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0f3d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#caa64b', fontWeight: 'bold', fontSize: 14 }}>SH</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: dark ? 'white' : '#111827' }}>Al Shifa Herb Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setDark(!dark)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', fontSize: 13, color: dark ? '#ccc' : '#666' }}>
            {dark ? '☀ Light' : '🌙 Dark'}
          </button>
          <button onClick={logout} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ef4444' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: dark ? 'white' : '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 24px' }}>Welcome to Al Shifa Herb admin panel</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Revenue', value: '₹0', color: '#caa64b' },
            { label: 'Orders', value: '0', color: '#3b82f6' },
            { label: 'Customers', value: '0', color: '#8b5cf6' },
            { label: 'Visitors', value: '0', color: '#6366f1' },
          ].map(s => (
            <div key={s.label} style={{ background: dark ? '#1a1d26' : 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
              <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, margin: '0 0 8px' }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: dark ? '#1a1d26' : 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: dark ? 'white' : '#374151', margin: '0 0 12px' }}>Data Loading...</h3>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Connecting to Supabase to load your store data.</p>
        </div>
      </div>
    </div>
  )
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}
