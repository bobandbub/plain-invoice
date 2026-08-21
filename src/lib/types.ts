export type InvoiceStatus = 'draft' | 'sent' | 'paid'
export type Plan = 'free' | 'pro'

export type AuthUser = {
  id: string
  email: string | null
}

export type LineItem = {
  id: string
  description: string
  quantity: number
  unit_amount_cents: number
  sort_order: number
}

export type Invoice = {
  id: string
  public_id: string
  number: string
  status: InvoiceStatus
  from_name: string
  from_email: string
  from_address: string
  to_name: string
  to_email: string
  to_address: string
  due_date: string | null
  notes: string
  payment_link: string
  currency: string
  created_at: string
  line_items: Array<LineItem>
}

export type InvoiceListItem = {
  id: string
  public_id: string
  number: string
  status: InvoiceStatus
  to_name: string
  due_date: string | null
  created_at: string
  total_cents: number
}

export type InvoiceInput = {
  id?: string
  from_name: string
  from_email: string
  from_address: string
  to_name: string
  to_email: string
  to_address: string
  due_date: string | null
  notes: string
  payment_link: string
  currency: string
  line_items: Array<{
    description: string
    quantity: number
    unit_amount_cents: number
  }>
}

export const FREE_LIMIT_CODE = 'FREE_LIMIT_REACHED'
