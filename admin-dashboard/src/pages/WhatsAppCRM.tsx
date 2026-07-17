import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, Phone, User, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const contacts = [
  { name: 'Rahul Sharma', phone: '+91 98765 43210', lastMsg: 'Order #ORD-001 confirmed', time: '2m ago', status: 'read', unread: 0 },
  { name: 'Priya Singh', phone: '+91 87654 32109', lastMsg: 'When will my order arrive?', time: '15m ago', status: 'delivered', unread: 2 },
  { name: 'Amit Kumar', phone: '+91 76543 21098', lastMsg: 'Thank you!', time: '1h ago', status: 'read', unread: 0 },
  { name: 'Sneha Patel', phone: '+91 65432 10987', lastMsg: 'I want to cancel order #ORD-005', time: '2h ago', status: 'pending', unread: 1 },
  { name: 'Vikram Joshi', phone: '+91 54321 09876', lastMsg: 'Payment done', time: '3h ago', status: 'read', unread: 0 },
  { name: 'Neha Gupta', phone: '+91 43210 98765', lastMsg: 'Is COD available?', time: '5h ago', status: 'delivered', unread: 0 },
  { name: 'Deepak Verma', phone: '+91 32109 87654', lastMsg: 'Address change needed', time: '1d ago', status: 'read', unread: 0 },
  { name: 'Anjali Reddy', phone: '+91 21098 76543', lastMsg: 'Product quality is great!', time: '2d ago', status: 'read', unread: 0 },
]

export default function WhatsAppCRM() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(0)
  const [msg, setMsg] = useState('')

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="space-y-6">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-gray-900 dark:text-white">
        WhatsApp CRM
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Contacts List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardContent className="p-4 shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm outline-none"
              />
            </div>
          </CardContent>
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {filtered.map((c, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selected === i
                    ? 'bg-[#0f3d2e]/5 dark:bg-[#0f3d2e]/20 border border-[#caa64b]/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0f3d2e] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                      <span className="text-[10px] text-gray-400">{c.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#25d366] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {filtered.length > 0 ? (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0f3d2e] flex items-center justify-center text-white text-xs font-bold">
                    {filtered[selected].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{filtered[selected].name}</p>
                    <p className="text-xs text-gray-400">{filtered[selected].phone}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm"><Phone size={14} /> Call</Button>
                    <Button variant="outline" size="sm"><Filter size={14} /> View Orders</Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[
                  { msg: 'Hello! How can I help you?', sent: false, time: '10:30 AM' },
                  { msg: 'I want to place an order for King Kong Oil', sent: true, time: '10:32 AM' },
                  { msg: 'Sure! We have King Kong Oil available at ₹499. Would you like to order?', sent: false, time: '10:33 AM' },
                  { msg: 'Yes please, COD.', sent: true, time: '10:35 AM' },
                  { msg: 'Perfect! Your order has been placed. Order ID: ORD-001', sent: false, time: '10:36 AM' },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${m.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      m.sent
                        ? 'bg-[#25d366] text-white rounded-br-md'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md'
                    }`}>
                      <p>{m.msg}</p>
                      <p className={`text-[10px] mt-1 ${m.sent ? 'text-white/70' : 'text-gray-400'}`}>{m.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex gap-3">
                  <input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#25d366]/30"
                    onKeyDown={e => e.key === 'Enter' && setMsg('')}
                  />
                  <Button variant="secondary" className="bg-[#25d366] hover:bg-[#1da851] text-white" onClick={() => setMsg('')}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">No contacts found</div>
          )}
        </Card>
      </div>
    </div>
  )
}
