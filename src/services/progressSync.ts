import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { useAccountStore } from '@/store/accountStore'
import { useProgressStore } from '@/store/progressStore'

export interface SyncResult {
	message?: string
	ok: boolean
	source: 'local' | 'remote' | 'skipped'
}

/**
 * M3 — Local-first progress sync.
 *
 * `pushProgress` always keeps the local store authoritative; when a Supabase
 * session is active it additionally upserts to the remote `progress` table.
 * `pullProgress` merges any remote completion into the local store. Without
 * Supabase configured both are no-ops that report `local` / `skipped`.
 */

export const pushProgress = async (): Promise<SyncResult> => {
	const { completedLevels } = useProgressStore.getState()
	const { isAuthed, profile } = useAccountStore.getState()
	if (!(isSupabaseConfigured && isAuthed && profile)) {
		return { ok: true, source: 'local' }
	}
	const sb = await getSupabaseClient()
	if (!sb) return { ok: true, source: 'skipped' }
	const { error } = await sb.from('progress').upsert({
		completed_levels: completedLevels,
		updated_at: new Date().toISOString(),
		user_id: profile.id,
	})
	return error
		? { message: String(error), ok: false, source: 'skipped' }
		: { ok: true, source: 'remote' }
}

export const pullProgress = async (): Promise<SyncResult> => {
	const { isAuthed, profile } = useAccountStore.getState()
	if (!(isSupabaseConfigured && isAuthed && profile)) return { ok: true, source: 'local' }
	const sb = await getSupabaseClient()
	if (!sb) return { ok: true, source: 'skipped' }
	const { data, error } = await sb
		.from('progress')
		.select('completed_levels')
		.eq('user_id', profile.id)
	if (error || !data) {
		return { message: String(error), ok: false, source: 'skipped' }
	}
	const remote = (data as { completed_levels?: string[] }[])[0]?.completed_levels ?? []
	const merged = Array.from(new Set([...useProgressStore.getState().completedLevels, ...remote]))
	merged.forEach((id) => {
		useProgressStore.getState().markLevelCompleted(id)
	})
	return { ok: true, source: 'remote' }
}
