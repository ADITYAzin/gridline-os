import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 40,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m14.7 10.7 5 5a1 1 0 0 1-1.4 1.4l-5-5" />
          <path d="M14.7 10.7A4 4 0 0 0 11.2 5a4 4 0 0 0-4.5 1.5l2.6 2.6a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0L3.9 9.3A4 4 0 0 0 5.4 13.8a4 4 0 0 0 5.7 1" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
