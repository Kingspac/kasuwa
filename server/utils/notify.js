// Sends a Telegram message to the shop owner when a new order arrives.
// If Telegram is not set up, or fails, the order is NOT affected: we only log.
const money = (n) => `₦${Number(n).toLocaleString('en-NG')}`

export async function notifyNewOrder(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  try {
    const lines = order.items.map(
      (i) => `${i.qty} x ${i.name}${i.size ? ` (${i.size})` : ''} - ${money(i.price * i.qty)}`,
    )
    const s = order.shipping
    const text = [
      `New order #${String(order._id).slice(-6).toUpperCase()}`,
      `Total: ${money(order.total)} (${order.paymentMethod === 'cod' ? 'pay on delivery' : 'Paystack'})`,
      '',
      ...lines,
      '',
      `Customer: ${s.fullName}`,
      `Phone: ${s.phone}`,
      `Address: ${s.address}, ${s.city}, ${s.state}`,
    ].join('\n')

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error(`Telegram notification failed (HTTP ${res.status})`)
  } catch (err) {
    console.error('Telegram notification failed:', err.message)
  }
}
