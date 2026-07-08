import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { validateLevelSchema } from '@/lib/levelValidator'
import type { UgcLevel } from '@/types/level'

// UTF-8 安全的 base64 编解码（关卡 JSON 含中文，需处理多字节）
const utf8ToBase64 = (str: string): string =>
	btoa(String.fromCharCode(...new TextEncoder().encode(str)))

const base64ToUtf8 = (b64: string): string => {
	const binary = atob(b64)
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
	return new TextDecoder().decode(bytes)
}

export type ImportResult =
	| { error?: string; level: UgcLevel; ok: true }
	| { error: string; level?: UgcLevel; ok: false }

export interface UgcStore {
	activeShared: UgcLevel | null
	decodeShare: (encoded: string) => ImportResult
	deleteDraft: (id: string) => void
	drafts: UgcLevel[]
	encodeShare: (level: UgcLevel) => string
	exportToText: (level: UgcLevel) => string
	getDraft: (id: string) => UgcLevel | undefined
	importFromText: (text: string) => ImportResult
	saveDraft: (level: UgcLevel) => void
	setActiveShared: (level: UgcLevel | null) => void
	updateDraft: (id: string, level: UgcLevel) => void
}

export const useUgcStore = create<UgcStore>()(
	persist(
		(set, get) => ({
			activeShared: null,
			decodeShare: (encoded) => {
				try {
					const json = base64ToUtf8(encoded)
					const parsed: unknown = JSON.parse(json)
					const result = validateLevelSchema(parsed)
					if (!result.ok) return { error: result.errors.join('; '), ok: false }
					return { level: result.data, ok: true }
				} catch {
					return { error: 'Invalid share payload', ok: false }
				}
			},
			deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
			drafts: [],
			encodeShare: (level) => utf8ToBase64(JSON.stringify(level)),
			exportToText: (level) => JSON.stringify(level, null, 2),
			getDraft: (id) => get().drafts.find((d) => d.id === id),
			importFromText: (text) => {
				try {
					const parsed: unknown = JSON.parse(text)
					const result = validateLevelSchema(parsed)
					if (!result.ok) return { error: result.errors.join('; '), ok: false }
					return { level: result.data, ok: true }
				} catch {
					return { error: 'Invalid JSON', ok: false }
				}
			},
			saveDraft: (level) =>
				set((s) => ({
					drafts: [...s.drafts.filter((d) => d.id !== level.id), level],
				})),
			setActiveShared: (level) => set({ activeShared: level }),
			updateDraft: (id, level) =>
				set((s) => ({ drafts: s.drafts.map((d) => (d.id === id ? level : d)) })),
		}),
		{ name: 'gitmaster-ugc-drafts', version: 1 }
	)
)
