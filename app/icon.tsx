import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const size = {
  width: 192,
  height: 192,
}
export const contentType = 'image/png'

/**
 * =========================================================================
 * LOKASI STYLING RADIUS ICON:
 * Ubah nilai ICON_BORDER_RADIUS di bawah ini:
 * - 0       : Kotak persegi (sharp square)
 * - 40      : Rounded squircle halus (standar app icon / default)
 * - '50%'   : Lingkaran penuh (circle)
 * =========================================================================
 */
export const ICON_BORDER_RADIUS: number | string = '50%'

export default function Icon() {
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
          borderRadius: ICON_BORDER_RADIUS,
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={base64Image}
          alt="Opilines Site Icon"
          width="192"
          height="192"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: ICON_BORDER_RADIUS,
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
