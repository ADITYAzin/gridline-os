export const STORAGE = {
  jobFilesBucket: 'job-files',
} as const

export const PHOTO = {
  maxPerTypePerJob: 10,
  maxBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const

export const JOB_NUMBER = {
  prefix: 'GL',
} as const

export const INVITE = {
  expiresInHours: 24,
} as const