import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag, IndianRupee, Users, Eye } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </motion.h1>
      <p className="text-sm text-gray-400">Your store performance at a glance</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: '₹0', icon: IndianRupee, color: '#caa64b' },
          { label: 'Orders', value: '0', icon: ShoppingBag, color: '#3b82f6' },
          { label: 'Customers', value: '0', icon: Users, color: '#8b5cf6' },
          { label: 'Visitors', value: '0', icon: Eye, color: '#6366f1' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '15' }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Welcome to Al Shifa Herb Dashboard</h3>
          <p className="text-sm text-gray-400">Data loading from Supabase database...</p>
        </CardContent>
      </Card>
    </div>
  )
}
