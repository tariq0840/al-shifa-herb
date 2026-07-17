import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ShoppingCart, Users, Package, Grid3X3, BarChart3, FileBarChart,
  MessageCircle, Send, Mail, Star, FileText, Image, Search, Settings,
  LogOut, ChevronLeft, Menu, TrendingUp, Tags, Gift, BookOpen, Globe, Zap,
  HelpCircle, ClipboardList, Users2, Warehouse, UserCheck
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  badge?: number
}

const navGroups: { label?: string; items: NavItem[] }[] = [
  {
    items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/' }],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Orders', icon: ShoppingCart, href: '/orders', badge: 12 },
      { label: 'Customers', icon: Users, href: '/customers' },
      { label: 'Products', icon: Package, href: '/products' },
      { label: 'Categories', icon: Grid3X3, href: '/categories' },
      { label: 'Inventory', icon: Warehouse, href: '/inventory' },
      { label: 'Coupons', icon: Gift, href: '/coupons' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics', icon: BarChart3, href: '/analytics' },
      { label: 'Marketing', icon: TrendingUp, href: '/marketing' },
    ],
  },
  {
    label: 'WhatsApp CRM',
    items: [
      { label: 'WhatsApp CRM', icon: MessageCircle, href: '/whatsapp' },
      { label: 'Bulk Messaging', icon: Send, href: '/bulk-messaging' },
      { label: 'Email Campaigns', icon: Mail, href: '/email-campaigns' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Reviews', icon: Star, href: '/reviews' },
      { label: 'Blog', icon: BookOpen, href: '/blog' },
      { label: 'Pages', icon: FileText, href: '/pages' },
      { label: 'Media Library', icon: Image, href: '/media' },
    ],
  },
  {
    label: 'SEO & AI',
    items: [
      { label: 'SEO', icon: Globe, href: '/seo' },
      { label: 'AI Content', icon: Zap, href: '/ai-content' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', icon: Settings, href: '/settings' },
      { label: 'Team Members', icon: Users2, href: '/team' },
      { label: 'Activity Logs', icon: ClipboardList, href: '/logs' },
    ],
  },
]

export default function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? navGroups.flatMap(g => g.items).filter(i =>
        i.label.toLowerCase().includes(search.toLowerCase())
      )
    : null

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col overflow-hidden"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#0f3d2e] flex items-center justify-center shrink-0">
          <span className="text-[#caa64b] font-bold text-sm">SH</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-semibold text-sm text-gray-800 dark:text-white whitespace-nowrap"
            >
              Al Shifa Herb
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#caa64b]/30"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {(filtered || navGroups).flatMap((group, gi) => {
          const items = filtered || group.items
          if (!items.length) return null
          return (
            <div key={gi}>
              {!filtered && group.label && !collapsed && (
                <p className="px-3 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 mb-2 tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {(items as NavItem[]).map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                      'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon size={18} className="shrink-0 group-hover:text-[#caa64b] transition-colors" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="truncate flex-1"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && item.badge && (
                      <span className="text-[10px] font-bold bg-[#caa64b]/10 text-[#caa64b] px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Collapse + Logout */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
        >
          <ChevronLeft size={18} className={cn('shrink-0 transition-transform', collapsed && 'rotate-180')} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
