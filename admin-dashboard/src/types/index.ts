export interface Order {
  id: number
  created_at: string
  customer_name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  products: any
  total: number
  status: string
  payment_method: string
  payment_status: string
  order_id: string
  notes?: string
}

export interface AnalyticsEvent {
  id: number
  event_type: string
  event_data: any
  session_id: string
  path: string
  referrer: string
  page_title: string
  duration_ms: number
  ip: string
  created_at: string
}

export interface SavedAddress {
  id: number
  phone: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  created_at: string
}

export interface Customer {
  phone: string
  name: string
  orders: number
  total_spent: number
  city: string
  last_order: string
  created_at: string
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface KpiCard {
  label: string
  value: number
  trend: number
  prefix?: string
  suffix?: string
  icon: string
  color: string
}
