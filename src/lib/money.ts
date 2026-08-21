export function formatMoney(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100)
}

export function dollarsToCents(value: string | number) {
  const n = typeof value === 'number' ? value : Number.parseFloat(value.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

export function centsToDollarInput(cents: number) {
  return ((cents || 0) / 100).toFixed(2)
}

export function lineTotalCents(quantity: number, unitAmountCents: number) {
  return Math.round((quantity || 0) * (unitAmountCents || 0))
}
