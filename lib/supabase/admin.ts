import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { requireEnv } from './env'

let cachedAdminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }
  return cachedAdminClient
}