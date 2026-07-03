// Provider-agnostic WhatsApp text sender. Works with Brazilian gateways like
// Z-API or Evolution API (both are a single HTTP POST with a phone + text).
//
// Configure via env (server-only, never shipped to the browser):
//   WHATSAPP_API_URL       full endpoint to POST to
//                          Z-API:     https://api.z-api.io/instances/<id>/token/<tok>/send-text
//                          Evolution: https://<host>/message/sendText/<instance>
//   WHATSAPP_API_TOKEN     token/apikey sent as a header (optional)
//   WHATSAPP_TOKEN_HEADER  header name for the token (default "Client-Token"; Evolution uses "apikey")
//   WHATSAPP_PHONE_FIELD   JSON field for the number (default "phone"; Evolution uses "number")
//   WHATSAPP_MESSAGE_FIELD JSON field for the text  (default "message"; Evolution uses "text")
//   WHATSAPP_DEFAULT_DDI   country code prepended when the number has none (default "55" = Brazil)

// Keep only digits and make sure the country code is present.
export function normalizePhone(raw: string): string | null {
  let d = (raw || '').replace(/\D/g, '')
  if (!d) return null
  const ddi = process.env.WHATSAPP_DEFAULT_DDI || '55'
  // Local BR numbers are 10-11 digits (DDD + number); prepend the country code.
  if (d.length <= 11) d = ddi + d
  return d
}

export function whatsappConfigured(): boolean {
  return !!process.env.WHATSAPP_API_URL
}

// Returns { ok } — never throws, so the reminder job can keep going.
export async function sendWhatsApp(phone: string, message: string): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.WHATSAPP_API_URL
  if (!url) return { ok: false, error: 'WHATSAPP_API_URL não configurada' }

  const num = normalizePhone(phone)
  if (!num) return { ok: false, error: 'telefone vazio/inválido' }

  const phoneField = process.env.WHATSAPP_PHONE_FIELD || 'phone'
  const msgField = process.env.WHATSAPP_MESSAGE_FIELD || 'message'
  const tokenHeader = process.env.WHATSAPP_TOKEN_HEADER || 'Client-Token'

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.WHATSAPP_API_TOKEN) headers[tokenHeader] = process.env.WHATSAPP_API_TOKEN

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ [phoneField]: num, [msgField]: message }),
    })
    if (!r.ok) return { ok: false, error: `gateway HTTP ${r.status}: ${(await r.text()).slice(0, 200)}` }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'erro de rede' }
  }
}
