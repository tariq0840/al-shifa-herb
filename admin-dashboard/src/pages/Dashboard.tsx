import { motion } from 'framer-motion'
import KpiCards from '@/components/dashboard/KpiCards'
import { Card, CardContent } from '@/components/ui/card'
import { useOrders, useAnalytics, useSalesData, useCustomers } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, ShoppingCart, Users, Eye, IndianRupee } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function MiniSparkline({ data, color = '#caa64b' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  const w = 120; const h = 32
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} className="w-full h-8">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatCard({ icon: Icon, label, value, trend, color }: { icon: any; label: string; value: string; trend?: string; color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '15' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        {trend && <p className="text-[10px] text-green-500 font-medium">{trend}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders(30)
  const { data: analytics } = useAnalytics(30)
  const { data: salesData } = useSalesData(30)
  const { data: customers } = useCustomers()

  const totals = {
    revenue: orders?.reduce((s, o) => s + o.total, 0) || 0,
    orders: orders?.length || 0,
    customers: customers?.length || 0,
    visitors: analytics?.filter(a => a.event_type === 'pageview').length || 0,
    avgOrder: orders?.length ? Math.round((orders.reduce((s, o) => s + o.total, 0) / orders.length)) : 0,
  }

  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
  const conversionRate = totals.visitors ? ((totals.orders / totals.visitors) * 100).toFixed(1) : '0'

  const recentOrders = orders?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </motion.h1>
          <p className="text-sm text-gray-400">Your store performance at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download size={14} />
            Export
          </Button>
          <select className="h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 outline-none focus:ring-2 focus:ring-[#caa64b]/30">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards totals={totals} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue Overview</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{formatRevenue(totals.revenue)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
                <TrendingUp size={14} /> +12.5%
              </div>
            </div>
            <div className="h-64">
              {salesData && salesData.length > 0 && (
                <RevenueChart data={salesData} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <StatCard icon={ShoppingCart} label="Pending Orders" value={String(pendingOrders)} trend="Needs attention" color="#f59e0b" />
          <StatCard icon={Users} label="Total Customers" value={String(totals.customers)} trend="+15% this month" color="#8b5cf6" />
          <StatCard icon={Eye} label="Conversion Rate" value={conversionRate + '%'} trend="+0.4% vs last month" color="#10b981" />
          <StatCard icon={IndianRupee} label="Avg Order Value" value={formatPrice(totals.avgOrder)} trend="+6.1%" color="#f97316" />
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Orders</h3>
            <a href="/orders" className="text-xs text-[#caa64b] font-medium hover:underline">View All →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium text-gray-400 text-[11px] uppercase">Order</th>
                  <th className="pb-3 font-medium text-gray-400 text-[11px] uppercase">Customer</th>
                  <th className="pb-3 font-medium text-gray-400 text-[11px] uppercase">Status</th>
                  <th className="pb-3 font-medium text-gray-400 text-[11px] uppercase">Total</th>
                  <th className="pb-3 font-medium text-gray-400 text-[11px] uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr><td colSpan={5} className="pt-4"><div className="h-20 skeleton" /></td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="pt-8 text-center text-gray-400 text-sm">No orders yet</td></tr>
                ) : recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="py-3 font-medium text-gray-900 dark:text-white">#{order.order_id?.slice(-6) || order.id}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{order.customer_name}</td>
                    <td className="py-3">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                        'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">₹{order.total}</td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources Mini */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {['direct', 'whatsapp', 'facebook', 'instagram', 'google'].map(s => {
                const count = analytics?.filter(a =>
                  a.event_data?.utm_source === s && a.event_type === 'pageview'
                ).length || 0
                const pct = totals.visitors ? ((count / totals.visitors) * 100).toFixed(1) : '0'
                const colors: Record<string, string> = {
                  direct: '#34a853', whatsapp: '#25d366', facebook: '#1877f2',
                  instagram: '#e1306c', google: '#4285f4'
                }
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">{s}</span>
                      <span className="text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', background: colors[s] || '#999' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Products</h3>
            <div className="space-y-3">
              {[{ name: 'King Kong Oil', qty: 12, rev: 5898 }, { name: 'He Max Powder', qty: 8, rev: 3992 }, { name: 'Testo King', qty: 6, rev: 2394 }].map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.qty} sold</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">₹{p.rev}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatRevenue(n: number) {
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L'
  return n.toLocaleString('en-IN')
}

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.revenue), 1)
  const w = 100; const h = 100
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.revenue / max) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#caa64b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#caa64b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${h} ${points.map((p, i) => {
        const [x, y] = p.split(',')
        if (i === 0) return `L${x},${y}`
        return `L${x},${y}`
      }).join(' ')} L${w},${h} Z`} fill="url(#revGrad)" />
      <polyline points={points} fill="none" stroke="#caa64b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i) => (
        <text key={i} x={(data.indexOf(d) / (data.length - 1)) * w} y={h + 8} textAnchor="middle" fontSize="4" fill="#9ca3af">
          {d.date.split(' ')[0]}
        </text>
      ))}
    </svg>
  )
}
