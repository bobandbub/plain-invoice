import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { FREE_INVOICE_LIMIT } from '#/lib/config'
import {
  invoiceInputSchema,
  mapInvoice,
  mapListItem,
  nextInvoiceNumber,
  publicId,
} from '#/lib/invoices'
import { createSupabaseServer, requireUser } from '#/lib/supabase.server'
import { FREE_LIMIT_CODE } from '#/lib/types'
import type { Invoice, InvoiceListItem, Plan } from '#/lib/types'

export type DashboardData = {
  invoices: Array<InvoiceListItem>
  plan: Plan
  invoiceCount: number
  remainingFree: number
}

const zId = z.object({ id: z.string().uuid() })
const zPublicId = z.object({ public_id: z.string().min(8).max(64) })
const zStatus = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'sent', 'paid']),
})

function isLimitError(message: string | undefined) {
  return Boolean(message && message.includes(FREE_LIMIT_CODE))
}

export const getDashboard = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardData> => {
    const { supabase, user } = await requireUser()

    await supabase.from('profiles').upsert(
      { id: user.id, email: user.email },
      { onConflict: 'id', ignoreDuplicates: true },
    )

    const [invoicesRes, profileRes] = await Promise.all([
      supabase
        .from('invoices')
        .select(
          'id, public_id, number, status, to_name, due_date, created_at, line_items(quantity, unit_amount_cents)',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle(),
    ])

    if (invoicesRes.error) throw new Error(invoicesRes.error.message)

    const plan: Plan = profileRes.data?.plan === 'pro' ? 'pro' : 'free'
    const invoices = invoicesRes.data.map((row) =>
      mapListItem(row as Record<string, unknown>),
    )

    return {
      invoices,
      plan,
      invoiceCount: invoices.length,
      remainingFree:
        plan === 'pro'
          ? Number.POSITIVE_INFINITY
          : Math.max(0, FREE_INVOICE_LIMIT - invoices.length),
    }
  },
)

export const getInvoice = createServerFn({ method: 'GET' })
  .validator(zId)
  .handler(async ({ data }): Promise<Invoice> => {
    const { supabase, user } = await requireUser()
    const { data: row, error } = await supabase
      .from('invoices')
      .select('*, line_items(*)')
      .eq('id', data.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!row) throw new Error('NOT_FOUND')
    return mapInvoice(row as Record<string, unknown>)
  })

export const getPublicInvoice = createServerFn({ method: 'GET' })
  .validator(zPublicId)
  .handler(async ({ data }): Promise<Invoice> => {
    const supabase = createSupabaseServer()
    const { data: row, error } = await supabase.rpc('get_public_invoice', {
      p_public_id: data.public_id,
    })
    if (error) throw new Error(error.message)
    const payload = typeof row === 'string' ? JSON.parse(row) : row
    if (!payload) throw new Error('NOT_FOUND')
    return mapInvoice(payload as Record<string, unknown>)
  })

export const saveInvoice = createServerFn({ method: 'POST' })
  .validator(invoiceInputSchema)
  .handler(async ({ data }): Promise<{ id: string; public_id: string }> => {
    const { supabase, user } = await requireUser()
    const parsed = data

    if (parsed.id) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          from_name: parsed.from_name,
          from_email: parsed.from_email,
          from_address: parsed.from_address,
          to_name: parsed.to_name,
          to_email: parsed.to_email,
          to_address: parsed.to_address,
          due_date: parsed.due_date || null,
          notes: parsed.notes,
          payment_link: parsed.payment_link,
          currency: parsed.currency,
        })
        .eq('id', parsed.id)
        .eq('user_id', user.id)

      if (updateError) throw new Error(updateError.message)

      const { error: deleteError } = await supabase
        .from('line_items')
        .delete()
        .eq('invoice_id', parsed.id)
      if (deleteError) throw new Error(deleteError.message)

      const { error: insertLinesError } = await supabase.from('line_items').insert(
        parsed.line_items.map((item, index) => ({
          invoice_id: parsed.id,
          description: item.description,
          quantity: item.quantity,
          unit_amount_cents: item.unit_amount_cents,
          sort_order: index,
        })),
      )
      if (insertLinesError) throw new Error(insertLinesError.message)

      const { data: existing } = await supabase
        .from('invoices')
        .select('public_id')
        .eq('id', parsed.id)
        .single()

      return { id: parsed.id, public_id: String(existing?.public_id ?? '') }
    }

    const { data: numbers } = await supabase
      .from('invoices')
      .select('number')
      .eq('user_id', user.id)

    const number = nextInvoiceNumber((numbers ?? []).map((row) => String(row.number)))
    const shareId = publicId()

    const { data: created, error: createError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        public_id: shareId,
        number,
        status: 'draft',
        from_name: parsed.from_name,
        from_email: parsed.from_email,
        from_address: parsed.from_address,
        to_name: parsed.to_name,
        to_email: parsed.to_email,
        to_address: parsed.to_address,
        due_date: parsed.due_date || null,
        notes: parsed.notes,
        payment_link: parsed.payment_link,
        currency: parsed.currency,
      })
      .select('id, public_id')
      .single()

    if (createError) {
      if (isLimitError(createError.message)) {
        throw new Error(FREE_LIMIT_CODE)
      }
      throw new Error(createError.message)
    }

    const { error: insertLinesError } = await supabase.from('line_items').insert(
      parsed.line_items.map((item, index) => ({
        invoice_id: created.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount_cents: item.unit_amount_cents,
        sort_order: index,
      })),
    )
    if (insertLinesError) throw new Error(insertLinesError.message)

    return { id: created.id, public_id: created.public_id }
  })

export const setInvoiceStatus = createServerFn({ method: 'POST' })
  .validator(zStatus)
  .handler(async ({ data }) => {
    const { supabase, user } = await requireUser()
    const { error } = await supabase
      .from('invoices')
      .update({ status: data.status })
      .eq('id', data.id)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    return { ok: true as const }
  })

export const deleteInvoice = createServerFn({ method: 'POST' })
  .validator(zId)
  .handler(async ({ data }) => {
    const { supabase, user } = await requireUser()
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', data.id)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    return { ok: true as const }
  })
