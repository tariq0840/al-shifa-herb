import { motion } from 'framer-motion'
import { cn, formatPrice, formatNumber } from '@/lib/utils'
import {
  IndianRupee, ShoppingBag, Clock, XCircle, Users, RefreshCw, TrendingUp,
  Eye, MessageCircle, AlertTriangle, UserCheck, BarChart3, Wallet
} from 'lucide-react'

interface KpiCardData {
  label: string
  value: number
  trend: number
  format?: 'currency' | 'number'
  icon: React.ElementType
  color: string
}

const cards: KpiCardData[] = [
  { label: "Today's Revenue", value: 0, trend: 0, format: 'currency', icon: IndianRupee, color: '#0f3d2e' },
  { label: 'Total Revenue', value: 0, trend: 12.5, format: 'currency', icon: Wallet, color: '#caa64b' },
  { label: 'Orders', value: 0, trend: 8.3, format: 'number', icon: ShoppingBag, color: '#3b82f6' },
  { label: 'Pending Orders', value: 0, trend: -2.1, format: 'number', icon: Clock, color: '#f59e0b' },
  { label: 'Cancelled', value: 0, trend: 0, format: 'number', icon: XCircle, color: '#ef4444' },
  { label: 'Customers', value: 0, trend: 15.2, format: 'number', icon: Users, color: '#8b5cf6' },
  { label: 'Returning Customers', value: 0, trend: 5.8, format: 'number', icon: RefreshCw, color: '#06b6d4' },
  { label: 'Conversion Rate', value: 3.2, trend: 0.4, format: 'number', icon: TrendingUp, color: '#10b981' },
  { label: 'Avg Order Value', value: 0, trend: 6.1, format: 'currency', icon: BarChart3, color: '#f97316' },
  { label: 'Visitors', value: 0, trend: 22.3, format: 'number', icon: Eye, color: '#6366f1' },
  { label: 'WhatsApp Leads', value: 0, trend: 45.0, format: 'number', icon: MessageCircle, color: '#25d366' },
  { label: 'Active Users', value: 0, trend: 10.5, format: 'number', icon: UserCheck, color: '#14b8a6' },
]

export default function KpiCards({ totals }: { totals: { revenue: number; orders: number; customers: number; visitors: number; avgOrder: number } }) {
  const data = cards.map(c => {
    let value = c.value
    if (c.label === "Today's Revenue" || c.label === 'Total Revenue') value = totals.revenue
    if (c.label === 'Orders') value = totals.orders
    if (c.label === 'Customers') value = totals.customers
    if (c.label === 'Visitors') value = totals.visitors
    if (c.label === 'Avg Order Value') value = totals.avgOrder
    return { ...c, value }
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {data.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
          className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Color accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: card.color }} />

          <div className="flex items-start justify-between mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: card.color + '15' }}
            >
              <card.icon size={16} style={{ color: card.color }} />
            </div>
            {card.trend !== 0 && (
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                card.trend > 0 ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              )}>
                {card.trend > 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
              </span>
            )}
          </div>

          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">{card.label}</p>
          <motion.p
            key={card.value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            {card.format === 'currency' ? formatPrice(card.value) : formatNumber(card.value)}
            {card.label === 'Conversion Rate' && '%'}
          </motion.p>

          <div className="mt-2 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 20">
              <path
                d="M0,10 C10,8 20,12 30,9 C40,6 50,14 60,11 C70,8 80,13 90,10 C95,9 98,10 100,10"
                fill="none"
                stroke={card.color + '40'}
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
