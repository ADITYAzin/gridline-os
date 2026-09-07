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

Dokumen Berita Acara Pekerjaan (BAP) dan bukti dokumentasi servis telah tercatat di sistem Gridline OS.

Terima kasih atas kepercayaan Anda menggunakan layanan kami!`

    case 'technician_dispatch':
      return `Halo ${technicianName},

Ada penugasan pekerjaan servis baru untuk Anda di sistem Gridline OS:

• No. Tiket: ${jobNumber}
• Customer: ${customerName}
• Layanan: ${serviceType}
${issue ? `• Kendala/Catatan: ${issue}\n` : ''}• Lokasi: ${address}
• Jadwal: ${scheduleDate}${timeStr}

Silakan buka aplikasi Gridline OS untuk memeriksa checklist SOP dan lakukan check-in GPS saat tiba di lokasi.`

    case 'custom':
    default:
      return `Halo ${customerName}, terkait pekerjaan servis ${jobNumber} (${serviceType})...`
  }
}

export function createWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone)
  if (!formattedPhone) return '#'
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
}
