/**
 * M3 — Supabase client factory (environment-driven, optional).
 *
 * Cloud sync is *inert* unless both `VITE_SUPABASE_URL` and
 * `VITE_SUPABASE_ANON_KEY` are present. The SDK is loaded via dynamic import so
 * the production bundle never fetches it in local-only mode, and the project
 * builds without `@supabase/supabase-js` installed. Once the package is added
 * and env vars are set, `getSupabaseClient()` returns a ready client.
 *
 * Install for cloud mode:  pnpm add @supabase/supabase-js
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** Minimal structural type — keeps this module decoupled from the SDK's full API. */
export interface SupabaseClientLike {
	auth: {
		getUser: () => Promise<{ data: { user: { email: string | null; id: string } | null } }>
		signInWithOAuth: (params: {
			provider: 'github' | 'google'
			redirectTo?: string
		}) => Promise<unknown>
		signInWithPassword: (params: { email: string; password: string }) => Promise<unknown>
		signOut: () => Promise<unknown>
	}
	from: (table: string) => {
		select: (columns?: string) => {
			eq: (column: string, value: unknown) => Promise<{ data: unknown; error: unknown | null }>
		}
		upsert: (values: Record<string, unknown>) => Promise<{ error: unknown | null }>
	}
}

let clientPromise: Promise<SupabaseClientLike | null> | null = null

export function getSupabaseClient(): Promise<SupabaseClientLike | null> {
	if (!isSupabaseConfigured) return Promise.resolve(null)
	if (!clientPromise) {
		clientPromise = import(/* @vite-ignore */ '@supabase/supabase-js')
			.then((mod) => {
				const { createClient } = mod as {
					createClient: (url: string, key: string) => SupabaseClientLike
				}
				return createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
			})
			.catch(() => null)
	}
	return clientPromise
}
