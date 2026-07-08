import { create } from 'zustand'
import { type PersistStorage, persist } from 'zustand/middleware'

/**
 * M1 — Progress persistence hardening.
 *
 * Adds:
 *  - `schemaVersion` + `migrate` so progress shape can evolve safely.
 *  - A tamper checksum over the persisted payload. If localStorage is edited
 *    by hand (e.g. someone sets all levels completed), the checksum mismatch
 *    flips `tamperDetected` and the UI can warn / reset. This is a client-side
 *    gate only — authoritative anti-cheat validation lands in M3 (server-side).
 */

const SCHEMA_VERSION = 1
// Not a secret — just a constant mixed into the checksum to raise the bar for
// trivial hand-edits of localStorage. Real security is delegated to M3.
const TAMPER_SALT = 'gitmaster-progress-v1'

interface ProgressState {
	clearTamper: () => void
	completedLevels: string[]
	isLevelCompleted: (levelId: string) => boolean
	markLevelCompleted: (levelId: string) => void
	resetProgress: () => void
	/** Set true when the persisted payload fails checksum verification. */
	tamperDetected: boolean
}

type PersistedProgress = Pick<ProgressState, 'completedLevels'>

// Lightweight, deterministic hash. Good enough as a client-side tamper gate;
// it is NOT cryptographically secure on purpose (see note above). Avoids
// bitwise operators to satisfy the project's Biome rules.
const computeChecksum = (data: string): string => {
	let h = 0
	for (let i = 0; i < data.length; i += 1) {
		// Plain modular arithmetic keeps `h` bounded and non-negative.
		h = (h * 31 + data.charCodeAt(i)) % 1_000_000_007
	}
	return `${h.toString(16)}:${TAMPER_SALT.length}`
}

// Module-level signal so the (typed) storage layer can report tamper back to
// the store after the store has been created (avoids a TDZ on the const).
let tamperFlag = false

const secureStorage: PersistStorage<PersistedProgress> = {
	getItem: (name) => {
		const raw = localStorage.getItem(name)
		if (!raw) return null
		try {
			const parsed = JSON.parse(raw) as {
				checksum?: string
				state?: PersistedProgress
				version?: number
			}
			if (!parsed.state) return null

			const expected = computeChecksum(JSON.stringify(parsed.state))
			if (parsed.checksum && parsed.checksum !== expected) {
				tamperFlag = true
			}
			return { state: parsed.state, version: parsed.version }
		} catch {
			// Corrupt payload — treat as no progress.
			return null
		}
	},
	removeItem: (name) => {
		try {
			localStorage.removeItem(name)
		} catch {
			// ignore
		}
	},
	setItem: (name, value) => {
		try {
			const checksum = computeChecksum(JSON.stringify(value.state))
			localStorage.setItem(name, JSON.stringify({ ...value, checksum }))
		} catch {
			// Storage unavailable — ignore so the app keeps working in-memory.
		}
	},
}

export const useProgressStore = create<ProgressState>()(
	persist(
		(set, get) => ({
			clearTamper: () => {
				set({ tamperDetected: false })
			},
			completedLevels: [],
			isLevelCompleted: (levelId) => get().completedLevels.includes(levelId),
			markLevelCompleted: (levelId) => {
				const { completedLevels } = get()
				if (!completedLevels.includes(levelId)) {
					set({ completedLevels: [...completedLevels, levelId] })
				}
			},
			resetProgress: () => {
				set({ completedLevels: [], tamperDetected: false })
			},
			tamperDetected: false,
		}),
		{
			migrate: (persisted, version) => {
				// Older builds stored a bare `completedLevels` array (version 0).
				if (version < SCHEMA_VERSION) {
					const data = persisted as { completedLevels?: unknown }
					const levels = Array.isArray(data?.completedLevels)
						? (data.completedLevels as string[]).filter((id) => typeof id === 'string')
						: []
					return { completedLevels: levels }
				}
				return persisted as PersistedProgress
			},
			name: 'gitmaster-progress',
			// Only persisted data is checksummed; methods / `tamperDetected` are derived.
			partialize: (state) => ({ completedLevels: state.completedLevels }),
			storage: secureStorage,
			version: SCHEMA_VERSION,
		}
	)
)

// Surface any tamper detected during rehydration (store is now initialized).
if (tamperFlag) {
	useProgressStore.setState({ tamperDetected: true })
	tamperFlag = false
}
