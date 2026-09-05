import 'server-only'

import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { type Role, roleHome } from '@/lib/rbac'

export type SessionProfile = {
  id: string
  orgId: string
  role: Role
  name: string
  email: string
}

export const getSessionProfile = cache(
  async (): Promise<SessionProfile | null> => {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, org_id, role, name, email')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return null
    }

    return {
      id: profile.id,
      orgId: profile.org_id,
      role: profile.role as Role,
      name: profile.name,
      email: profile.email,
    }
  },
)

export async function requireUser(): Promise<SessionProfile> {
  const profile = await getSessionProfile()
  if (!profile) {
    redirect('/login')
  }
  return profile
}

export async function requireRole(role: Role): Promise<SessionProfile> {
  const profile = await requireUser()
  if (profile.role !== role) {
    notFound()
  }
  return profile
}

export function homeForRole(role: Role): string {
  return roleHome[role]
}