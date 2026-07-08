/**
 * Ambient declaration for `@supabase/supabase-js`.
 *
 * The real SDK is an OPTIONAL dependency: cloud sync only activates when the
 * package is installed AND `VITE_SUPABASE_*` env vars are set. Declaring the
 * minimal surface we use lets `tsc` pass (and `vite build` stay green) without
 * bundling the SDK in local-only mode. Install with: pnpm add @supabase/supabase-js
 */
declare module '@supabase/supabase-js' {
	export interface SupabaseClient {
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

	export function createClient(url: string, key: string, options?: unknown): SupabaseClient
}
