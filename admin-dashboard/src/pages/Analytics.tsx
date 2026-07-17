import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { useAnalytics, useOrders, useSalesData } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, Users, ShoppingCart, Eye } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: analytics } = useAnalytics(90)
  const { data: orders } = useOrders(90)
  const { data: salesData } = useSalesData(90)

  const pageviews = analytics?.filter(a => a.event_type === 'pageview').length || 0
  const visitors = new Set(analytics?.filter(a => a.event_type === 'pageview').map(a => a.session_id)).size || 0
  const totalRevenue = orders?.reduce((s, o) => s + o.total, 0) || 0

  const stats = [
    { label: 'Total Revenue', value: '₹' + (totalRevenue >= 100000 ? (totalRevenue/100000).toFixed(1)+'L' : totalRevenue.toLocaleString('en-IN')), icon: TrendingUp, color: '#caa64b', trend: '+12.3%' },
    { label: 'Visitors', value: String(visitors), icon: Users, color: '#6366f1', trend: '+22.1%' },
    { label: 'Page Views', value: String(pageviews), icon: Eye, color: '#3b82f6', trend: '+18.7%' },
    { label: 'Orders', value: String(orders?.length || 0), icon: ShoppingCart, color: '#10b981', trend: '+8.4%' },
  ]

  const pages: Record<string, number> = {}
  analytics?.filter(a => a.event_type === 'pageview' && a.path).forEach(a => {
    const p = a.path!.replace(/\/+$/, '') || '/'
    pages[p] = (pages[p] || 0) + 1
  })
  const topPages = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const sources = [
    { name: 'Direct', color: '#34a853', key: '' },
    { name: 'WhatsApp', color: '#25d366', key: 'whatsapp' },
    { name: 'Facebook', color: '#1877f2', key: 'facebook' },
    { name: 'Instagram', color: '#e1306c', key: 'instagram' },
    { name: 'Google', color: '#4285f4', key: 'google' },
  ].map(s => {
    const count = analytics?.filter(a =>
      a.event_type === 'pageview' && (
        s.key ? a.event_data?.utm_source === s.key
          : !a.event_data?.utm_source || a.event_data?.utm_source === 'direct'
      )
    ).length || 0
    const pct = pageviews ? ((count / pageviews) * 100).toFixed(1) : '0'
    return { ...s, count, pct }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </motion.h1>
          <p className="text-sm text-gray-400">Track your store performance and growth</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download size={14} /> PDF</Button>
          <Button variant="outline" size="sm"><Download size={14} /> Excel</Button>
          <select className="h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 outline-none">
            <option>Last 90 days</option>
            <option>Last 30 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '15' }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <span className="text-xs font-medium text-green-500">{s.trend}</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue Over Time</h3>
            <div className="flex gap-2">
              {['Daily', 'Weekly', 'Monthly'].map(f => (
                <button key={f} className="text-xs px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium hover:bg-[#caa64b]/10 hover:text-[#caa64b] transition-colors">
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {salesData && salesData.length > 0 ? (
              <SalesChart data={salesData} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {sources.map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">{s.name}</span>
                    <span className="text-gray-400">{s.count} ({s.pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: s.pct + '%', background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Sales Funnel</h3>
            <div className="space-y-4">
              {[
                { label: 'Visitors', count: visitors, pct: 100, color: '#6366f1' },
                { label: 'Page Views', count: pageviews, pct: visitors ? Math.round((pageviews/visitors)*100) : 0, color: '#3b82f6' },
                { label: 'Orders', count: orders?.length || 0, pct: visitors ? Math.round(((orders?.length||0)/visitors)*100) : 0, color: '#10b981' },
                { label: 'Conversion', count: visitors ? parseFloat(((orders?.length||0)/visitors*100).toFixed(1)) : 0, pct: visitors ? Math.round(((orders?.length||0)/visitors)*100) : 0, color: '#caa64b', isPct: true },
              ].map((s, i) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">{s.label}</span>
                    <span className="text-gray-400 font-semibold">{s.isPct ? s.count + '%' : s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: s.pct + '%' }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Pages</h3>
            <div className="space-y-2">
              {topPages.length > 0 ? topPages.map(([path, count], i) => (
                <div key={path} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[180px]">{path || '/'}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-8">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SalesChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.revenue), 1)
  const w = Math.max(data.length * 6, 200)
  const h = 260
  const barW = Math.max(4, Math.min(20, (w / data.length) - 2))
  const gradId = 'salesGrad'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#caa64b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#caa64b" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const x = i * (w / data.length) + (w / data.length - barW) / 2
        const barH = (d.revenue / max) * (h - 40)
        return (
          <motion.rect
            key={i}
            initial={{ height: 0, y: h - 20 }}
            animate={{ height: barH, y: h - 20 - barH }}
            transition={{ delay: i * 0.003, duration: 0.4 }}
            x={x} y={h - 20 - barH} width={barW} height={barH} rx={2}
            fill={`url(#${gradId})`}
          />
        )
      })}
      {[0, 25, 50, 75, 100].map(p => (
        <text key={p} x={0} y={h - 20 - (p / 100) * (h - 40)} fontSize="8" fill="#9ca3af">
          {Math.round((max * p) / 100)}
        </text>
      ))}
    </svg>
  )
}
