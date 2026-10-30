/**
 * Helper to normalize Indonesian and international phone numbers for WhatsApp.
 * Converts '0812...' to '62812...', removes non-digits, and handles '+62'.
 */
export function formatWhatsAppPhone(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Remove any character that is not a digit or plus
  let cleaned = phone.replace(/[^0-9+]/g, '')

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }

  // If starts with 08..., convert to 628...
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }

  if (cleaned.length < 8) return null

  return cleaned
}

export interface WhatsAppTemplateData {
  customerName?: string
  technicianName?: string
  jobNumber?: string
  serviceType?: string
  address?: string
  scheduleDate?: string
  scheduleTime?: string
  issue?: string
}

export type WhatsAppScenario =
  | 'customer_scheduled'
  | 'customer_on_the_way'
  | 'customer_completed'
  | 'technician_dispatch'
  | 'custom'

export function generateWhatsAppMessage(
  scenario: WhatsAppScenario,
  data: WhatsAppTemplateData
): string {
  const {
    customerName = 'Bapak/Ibu',
    technicianName = 'Teknisi Kami',
    jobNumber = '-',
    serviceType = 'Layanan Servis',
    address = '-',
    scheduleDate = 'Hari ini',
    scheduleTime = '',
    issue = '',
  } = data

  const timeStr = scheduleTime ? ` pukul ${scheduleTime}` : ''

  switch (scenario) {
    case 'customer_scheduled':
      return `Halo ${customerName},

Terima kasih telah mempercayakan layanan kepada tim kami.
Pekerjaan servis Anda telah dijadwalkan dengan detail berikut:

• No. Tiket: ${jobNumber}
• Jenis Layanan: ${serviceType}
• Jadwal: ${scheduleDate}${timeStr}
• Teknisi Bertugas: ${technicianName}
• Lokasi: ${address}

Teknisi kami akan hadir sesuai jadwal di atas. Mohon pastikan ada perwakilan di lokasi. Jika ada perubahan jadwal, silakan balas pesan ini. Terima kasih!`

    case 'customer_on_the_way':
      return `Halo ${customerName},

Teknisi kami, ${technicianName}, saat ini sedang dalam perjalanan menuju lokasi Anda untuk tiket ${jobNumber} (${serviceType}).

Estimasi tiba segera di:
${address}

Mohon kesediaannya di tempat. Terima kasih!`

    case 'customer_completed':
      return `Halo ${customerName},

Pemberitahuan bahwa pekerjaan servis untuk tiket ${jobNumber} (${serviceType}) telah selesai dilaksanakan oleh teknisi kami (${technicianName}).

Dokumen Berita Acara Pekerjaan (BAP) dan bukti dokumentasi servis telah tercatat di sistem Opilines.

Terima kasih atas kepercayaan Anda menggunakan layanan kami!`

    case 'technician_dispatch':
      return `Halo ${technicianName},

Ada penugasan pekerjaan servis baru untuk Anda di sistem Opilines:

• No. Tiket: ${jobNumber}
• Customer: ${customerName}
• Layanan: ${serviceType}
${issue ? `• Kendala/Catatan: ${issue}\n` : ''}• Lokasi: ${address}
• Jadwal: ${scheduleDate}${timeStr}

Silakan buka aplikasi Opilines untuk memeriksa checklist SOP dan lakukan check-in GPS saat tiba di lokasi.`

    case 'custom':
    default:
      return `Halo ${customerName}, terkait pekerjaan servis ${jobNumber} (${serviceType})...`
  }
}

export const WA_WINDOW_NAME = 'gridline_whatsapp'

export function createWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone)
  if (!formattedPhone) return '#'
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
}

export function createWhatsAppWebDirectUrl(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone)
  if (!formattedPhone) return '#'
  return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
}

export function createWhatsAppProtocolUrl(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone)
  if (!formattedPhone) return '#'
  return `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
}

export type WhatsAppTargetPlatform = 'web_tab' | 'app' | 'auto'

export function openWhatsAppTargeted({
  phone,
  message,
  targetPlatform = 'web_tab',
}: {
  phone: string
  message: string
  targetPlatform?: WhatsAppTargetPlatform
}): void {
  if (typeof window === 'undefined') return

  const formattedPhone = formatWhatsAppPhone(phone)
  if (!formattedPhone) return

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  // 1. If 'app' mode selected or detected as mobile device, trigger native WhatsApp protocol directly (0 browser tabs)
  if (targetPlatform === 'app' || (targetPlatform === 'auto' && isMobile)) {
    const protocolUrl = createWhatsAppProtocolUrl(formattedPhone, message)
    const anchor = document.createElement('a')
    anchor.href = protocolUrl
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    return
  }

  // 2. Desktop WhatsApp Web: Reuse single named window context ('gridline_whatsapp') to prevent opening duplicate tabs
  const webUrl = createWhatsAppWebDirectUrl(formattedPhone, message)
  const targetWindow = window.open(webUrl, WA_WINDOW_NAME)
  if (targetWindow) {
    try {
      targetWindow.focus()
    } catch {
      // Browsers may restrict focus() across different origins
    }
  }
}

