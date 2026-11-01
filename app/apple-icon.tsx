import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

/**
 * =========================================================================
 * LOKASI STYLING RADIUS APPLE ICON:
 * Ubah nilai APPLE_ICON_BORDER_RADIUS di bawah ini:
 * - 0       : Kotak persegi
 * - 38      : Rounded squircle halus (Apple touch icon / default)
 * - '50%'   : Lingkaran penuh
 * =========================================================================
 */
export const APPLE_ICON_BORDER_RADIUS: number | string = 38

export default function AppleIcon() {
  const imagePath = path.join(process.cwd(), 'public/images/opilines-site-logo.png')
  const fileBuffer = fs.readFileSync(imagePath)
  const base64Image = `data:image/png;base64,${fileBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          borderRadius: APPLE_ICON_BORDER_RADIUS,
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={base64Image}
          alt="Opilines Apple Touch Icon"
          width="180"
          height="180"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: APPLE_ICON_BORDER_RADIUS,
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
