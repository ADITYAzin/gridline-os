export const ROLES = ['admin', 'technician', 'owner'] as const

export type Role = (typeof ROLES)[number]

export const roleHome: Record<Role, string> = {
  admin: '/admin',
  technician: '/technician',
  owner: '/owner',
}

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role)
}