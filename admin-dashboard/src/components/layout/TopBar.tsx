import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, MessageCircle, Sun, Moon, Plus, User, ChevronDown, Calendar, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/App'
import { cn } from '@/lib/utils'

export default function TopBar({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const [showProfile, setShowProfile] = useState(false)
  const { logout } = useAuth()

  return (
    <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left - Search + Quick Create */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search orders, customers, products..."
            className="w-72 h-10 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#caa64b]/30"
          />
        </div>
        <Button variant="primary" size="sm" className="hidden md:flex gap-1.5">
          <Plus size={16} />
          Quick Create
        </Button>
      </div>

      {/* Right - Stats + Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Today</span>
          <span className="text-sm font-bold text-[#0f3d2e] dark:text-[#caa64b]">₹0</span>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="relative p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <MessageCircle size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#25d366] rounded-full" />
        </button>

        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          {dark ? <Sun size={18} className="text-gray-500" /> : <Moon size={18} className="text-gray-500" />}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0f3d2e] flex items-center justify-center text-white text-xs font-bold">
              TA
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Tariq Ahmad</p>
              <p className="text-[10px] text-gray-400">Admin</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg z-20 p-2"
              >
                {['Profile', 'Settings', 'Help Center'].map(item => (
                  <button key={item} className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {item}
                  </button>
                ))}
                <hr className="my-1 border-gray-100 dark:border-gray-800" />
                <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2">
                  <LogOut size={14} /> Sign Out
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
