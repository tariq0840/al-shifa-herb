import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order, AnalyticsEvent, Customer, SalesData } from '@/types'
import { subDays, format } from 'date-fns'

export function useOrders(days = 30) {
  return useQuery({
    queryKey: ['orders', days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Order[]
    },
    refetchInterval: 30000,
  })
}

export function useAnalytics(days = 30) {
  return useQuery({
    queryKey: ['analytics', days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString()
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as AnalyticsEvent[]
    },
    refetchInterval: 30000,
  })
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('customer_name, phone, city, total, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      const map = new Map<string, Customer>()
      for (const o of data) {
        if (!map.has(o.phone)) {
          map.set(o.phone, {
            phone: o.phone,
            name: o.customer_name,
            orders: 0,
            total_spent: 0,
            city: o.city || '',
            last_order: o.created_at,
            created_at: o.created_at,
          })
        }
        const c = map.get(o.phone)!
        c.orders++
        c.total_spent += o.total
        if (new Date(o.created_at) > new Date(c.last_order)) {
          c.last_order = o.created_at
        }
      }
      return Array.from(map.values())
    },
  })
}

export function useSalesData(days = 30) {
  return useQuery({
    queryKey: ['salesData', days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString()
      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', since)
      if (error) throw error

      const map = new Map<string, SalesData>()
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i)
        const key = format(d, 'MMM dd')
        map.set(key, { date: key, revenue: 0, orders: 0 })
      }
      for (const o of data) {
        const key = format(new Date(o.created_at), 'MMM dd')
        if (map.has(key)) {
          const entry = map.get(key)!
          entry.revenue += o.total
          entry.orders++
        }
      }
      return Array.from(map.values())
    },
  })
}
