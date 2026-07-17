import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/hooks/useData'
import { Search, Filter, Download, Eye, ChevronDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders(90)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = (orders || []).filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order_id?.includes(search) || o.phone?.includes(search)
    return matchStatus && matchSearch
  })

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </motion.h1>
          <p className="text-sm text-gray-400">{statusCounts.all} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
          <Button variant="primary" size="sm">+ New Order</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: 'All', key: 'all', count: statusCounts.all },
          { label: 'Pending', key: 'pending', count: statusCounts.pending },
          { label: 'Delivered', key: 'delivered', count: statusCounts.delivered },
          { label: 'Cancelled', key: 'cancelled', count: statusCounts.cancelled },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              statusFilter === s.key
                ? 'bg-[#0f3d2e] text-white'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="h-9 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs outline-none w-48"
            />
          </div>
          <Button variant="ghost" size="sm"><Filter size={14} /> Filters</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 skeleton" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Order ID</th>
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Customer</th>
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Products</th>
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Total</th>
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Status</th>
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Payment</th>
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Date</th>
                    <th className="text-left p-4 font-medium text-gray-400 text-[11px] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">No orders found</td></tr>
                  ) : filtered.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900 dark:text-white">#{order.order_id?.slice(-8) || order.id}</td>
                      <td className="p-4">
                        <p className="font-medium text-gray-700 dark:text-gray-300">{order.customer_name}</p>
                        <p className="text-[11px] text-gray-400">{order.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-gray-500">
                          {(() => {
                            try {
                              const prods = typeof order.products === 'string' ? JSON.parse(order.products) : order.products
                              return Array.isArray(prods) ? prods.length + ' items' : '1 item'
                            } catch { return '1 item' }
                          })()}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">₹{order.total}</td>
                      <td className="p-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                          'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400'
                        }`}>{order.status}</span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">{order.payment_method || 'COD'}</td>
                      <td className="p-4 text-xs text-gray-400">{formatDate(order.created_at)}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
