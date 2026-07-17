import { useState, useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbbkbsdikayrdocvpmea.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmtic2Rpa2F5cmRvY3ZwbWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDMwMjEsImV4cCI6MjA5ODgxOTAyMX0.t5EV8_mahMxP2VDYoFmv1sgW3RYjxeUlQkqbN9EHd2U'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const queryClient = new QueryClient()

function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('admin_auth') === 'true')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(false)
  const [data, setData] = useState<any>(null)
  const [dataErr, setDataErr] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    if (!authed) return
    fetchData()
  }, [authed])

  const fetchData = async () => {
    try {
      const since = new Date(Date.now() - 30*24*60*60*1000).toISOString()

      const [ordersRes, analyticsRes] = await Promise.all([
        supabase.from('orders').select('total, status, customer_name, phone, created_at, order_id').gte('created_at', since).order('created_at', { ascending: false }),
        supabase.from('analytics').select('event_type, event_data, session_id, path, created_at').gte('created_at', since).order('created_at', { ascending: false }),
      ])

      if (ordersRes.error) throw ordersRes.error
      if (analyticsRes.error) throw analyticsRes.error

      const orders = ordersRes.data || []
      const analytics = analyticsRes.data || []

      const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0)
      const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length
      const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length
      const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled').length
      const customers = new Set(orders.map((o: any) => o.phone)).size
      const pageviews = analytics.filter((a: any) => a.event_type === 'pageview').length
      const visitors = new Set(analytics.filter((a: any) => a.event_type === 'pageview').map((a: any) => a.session_id)).size
      const avgOrder = orders.length ? Math.round(totalRevenue / orders.length) : 0

      // Traffic sources
      const sources: Record<string, number> = {}
      analytics.forEach((a: any) => {
        if (a.event_type === 'pageview') {
          const src = a.event_data?.utm_source || 'direct'
          sources[src] = (sources[src] || 0) + 1
        }
      })

      // Sales data (last 7 days)
      const salesMap: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i*24*60*60*1000)
        salesMap[d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })] = 0
      }
      orders.forEach((o: any) => {
        const key = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        if (key in salesMap) salesMap[key] += o.total || 0
      })

      setData({
        totalRevenue, pendingOrders, deliveredOrders, cancelledOrders,
        customers, pageviews, visitors, avgOrder, orders: orders.slice(0, 10),
        sources, salesData: Object.entries(salesMap).map(([d, v]) => ({ date: d, revenue: v })),
      })
    } catch (e: any) {
      setDataErr(e.message)
    }
  }

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
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter admin password"
              style={{ width: '100%', height: 48, padding: '0 16px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              autoComplete="current-password" />
            {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{err}</p>}
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', height: 48, borderRadius: 12, background: '#0f3d2e', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  }

  const formatPrice = (n: number) => '₹' + (n >= 100000 ? (n/100000).toFixed(1) + 'L' : n.toLocaleString('en-IN'))

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#0f1117' : '#f8f9fc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Bar */}
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
          <button onClick={logout} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ef4444' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: dark ? 'white' : '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 24px' }}>Your store performance at a glance</p>

        {!data ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>⏳ Loading data from Supabase...</div>
            {dataErr && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>Error: {dataErr}</div>}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Revenue (30d)', value: formatPrice(data.totalRevenue), color: '#caa64b' },
                { label: 'Orders', value: String(data.orders.length || '0') + ' (' + data.pendingOrders + ' pending)', color: '#3b82f6' },
                { label: 'Delivered', value: String(data.deliveredOrders), color: '#10b981' },
                { label: 'Cancelled', value: String(data.cancelledOrders), color: '#ef4444' },
                { label: 'Customers', value: String(data.customers), color: '#8b5cf6' },
                { label: 'Visitors', value: String(data.visitors), color: '#6366f1' },
                { label: 'Page Views', value: String(data.pageviews), color: '#f59e0b' },
                { label: 'Avg Order', value: formatPrice(data.avgOrder), color: '#f97316' },
              ].map(s => (
                <div key={s.label} style={{ background: dark ? '#1a1d26' : 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, margin: '0 0 8px' }}>{s.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart + Traffic Sources */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Sales Chart */}
              <div style={{ background: dark ? '#1a1d26' : 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: dark ? 'white' : '#374151', margin: '0 0 16px' }}>Revenue (Last 7 Days)</h3>
                <div style={{ display: 'flex', alignItems: 'end', gap: 2, height: 120, paddingTop: 8 }}>
                  {data.salesData.map((d: any, i: number) => {
                    const max = Math.max(...data.salesData.map((x: any) => x.revenue), 1)
                    const h = (d.revenue / max) * 100
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', background: '#caa64b', borderRadius: '4px 4px 0 0', height: Math.max(h, 2), transition: 'height 0.5s' }} />
                        <span style={{ fontSize: 9, color: '#9ca3af', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{d.date}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Traffic Sources */}
              <div style={{ background: dark ? '#1a1d26' : 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: dark ? 'white' : '#374151', margin: '0 0 16px' }}>Traffic Sources</h3>
                {Object.entries(data.sources).length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>No traffic data yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(data.sources)
                      .sort(([,a]: any, [,b]: any) => b - a)
                      .map(([src, count]: any) => {
                        const pct = ((count / (data.pageviews || 1)) * 100).toFixed(1)
                        return (
                          <div key={src}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                              <span style={{ color: dark ? '#ccc' : '#374151', fontWeight: 500, textTransform: 'capitalize' }}>{src}</span>
                              <span style={{ color: '#9ca3af' }}>{count} ({pct}%)</span>
                            </div>
                            <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: pct + '%', background: '#caa64b', borderRadius: 3, transition: 'width 0.5s' }} />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div style={{ background: dark ? '#1a1d26' : 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: dark ? 'white' : '#374151', margin: '0 0 16px' }}>Recent Orders</h3>
              {data.orders.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>No orders in last 30 days</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>Order</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>Customer</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>Total</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((o: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: dark ? 'white' : '#111827' }}>#{o.order_id?.slice(-6) || o.id}</td>
                          <td style={{ padding: '10px 12px', color: dark ? '#ccc' : '#4b5563' }}>{o.customer_name}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                              color: o.status === 'delivered' ? '#059669' : o.status === 'cancelled' ? '#dc2626' : '#d97706',
                              background: o.status === 'delivered' ? '#ecfdf5' : o.status === 'cancelled' ? '#fef2f2' : '#fffbeb',
                            }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: dark ? 'white' : '#111827' }}>₹{o.total}</td>
                          <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Traffic Sources Mini - Platform Breakdown */}
            <div style={{ background: dark ? '#1a1d26' : 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: dark ? 'white' : '#374151', margin: '0 0 8px' }}>Platform Breakdown</h3>
              <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 16px' }}>WhatsApp, Facebook, Instagram, Direct visitors</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(data.sources)
                  .sort(([,a]: any, [,b]: any) => b - a)
                  .map(([src, count]: any) => (
                    <div key={src} style={{
                      padding: '8px 16px', borderRadius: 8,
                      background: src === 'whatsapp' ? '#25d366' : src === 'facebook' ? '#1877f2' : src === 'instagram' ? '#e1306c' : src === 'direct' ? '#34a853' : '#6b7280',
                      color: 'white', fontSize: 13, fontWeight: 600, textTransform: 'capitalize'
                    }}>
                      {src}: {count}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
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
