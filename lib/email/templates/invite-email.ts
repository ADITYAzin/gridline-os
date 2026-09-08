interface InviteEmailData {
  inviterName: string
  organizationName: string
  role: string
  inviteLink: string
  expiresInHours?: number
}

export function generateInviteEmailHtml({
  inviterName,
  organizationName,
  role,
  inviteLink,
  expiresInHours = 24,
}: InviteEmailData): string {
  const roleName =
    role === 'technician'
      ? 'Teknisi Lapangan (Technician)'
      : role === 'admin'
      ? 'Administrator'
      : role

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Undangan Bergabung - Gridline OS</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 8px 12px; background: rgba(59, 130, 246, 0.2); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
                      Gridline OS
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; line-height: 28px;">
                      Undangan Bergabung ke Tim Lapangan
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
                Halo,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #334155;">
                <strong>${inviterName}</strong> telah mengundang Anda untuk bergabung ke dalam organisasi <strong>${organizationName}</strong> di sistem Gridline OS sebagai <strong>${roleName}</strong>.
              </p>

              <!-- Role Info Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Posisi / Hak Akses:</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${roleName}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Klik tombol di bawah ini untuk mengonfirmasi email Anda dan membuat kata sandi baru. Tautan ini bersifat rahasia dan berlaku selama <strong>${expiresInHours} jam</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                      Aktivasi Akun & Buat Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <div style="padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                  Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke peramban (browser) Anda:
                </p>
                <p style="margin: 0; font-size: 12px; word-break: break-all; color: #2563eb;">
                  <a href="${inviteLink}" style="color: #2563eb; text-decoration: underline;">${inviteLink}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8;">
                Email ini dikirim otomatis oleh sistem Gridline OS untuk ${organizationName}.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                Jika Anda merasa tidak mengenali pengundang ini, abaikan pesan ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
