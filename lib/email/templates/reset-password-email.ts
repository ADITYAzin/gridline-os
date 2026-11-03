interface ResetPasswordEmailData {
  userName?: string
  resetLink: string
  otpCode?: string
  expiresInMinutes?: number
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function generateResetPasswordEmailHtml({
  userName,
  resetLink,
  otpCode,
  expiresInMinutes = 60,
}: ResetPasswordEmailData): string {
  const safeName = userName ? escapeHtml(userName.trim()) : ''
  const greeting = safeName ? `Halo ${safeName},` : 'Halo,'
  const safeOtp = otpCode ? escapeHtml(otpCode.trim()) : ''

  const otpSection = safeOtp
    ? `
              <!-- 6-Digit OTP Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                      Kode Verifikasi OTP
                    </p>
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 30px; font-weight: 700; letter-spacing: 8px; color: #0f172a; padding-left: 8px;">
                      ${safeOtp}
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569; text-align: center;">
                Masukkan 6 digit kode di atas pada halaman verifikasi OTP, atau klik tombol di bawah untuk langsung mereset password:
              </p>
`
    : `
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #334155;">
                Klik tombol di bawah ini untuk membuat password baru:
              </p>
`

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - Opilines</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: left;">
              <div style="display: inline-block; padding: 8px 12px; background: rgba(59, 130, 246, 0.2); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
                Opilines
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; line-height: 28px;">
                Permintaan Reset Password
              </h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
                ${greeting}
              </p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
                Kami menerima permintaan untuk mereset password akun Opilines Anda.
              </p>
              ${otpSection}
              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; background-color: #007ACC; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 122, 204, 0.2);">
                      Reset Password Akun
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 20px; color: #64748b;">
                Kode dan tautan pemulihan ini berlaku selama <strong>${expiresInMinutes} menit</strong> dan hanya dapat digunakan satu kali. Jangan bagikan kode ini kepada siapa pun.
              </p>

              <!-- Alternative Link -->
              <div style="padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                  Jika tombol tidak bisa diklik, salin dan tempel tautan berikut ke browser Anda:
                </p>
                <p style="margin: 0; font-size: 12px; word-break: break-all; color: #007ACC;">
                  <a href="${resetLink}" style="color: #007ACC; text-decoration: underline;">${resetLink}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8;">
                Jika Anda tidak meminta reset password, abaikan email ini dengan aman.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                &copy; Opilines — Field Service Management
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
