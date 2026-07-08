// CI 门禁：校验 i18n 翻译键在 en.json 与 zh-CN.json 之间完全同构。
// 防止后续新增/删除翻译键时中英文漂移。运行：node scripts/check-i18n.mjs
import { readFileSync } from 'node:fs'

const EN = 'src/i18n/locales/en.json'
const ZH = 'src/i18n/locales/zh-CN.json'

function flatten(obj, prefix = '') {
	return Object.entries(obj).flatMap(([k, v]) =>
		v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]
	)
}

const en = flatten(JSON.parse(readFileSync(EN, 'utf8')))
const zh = flatten(JSON.parse(readFileSync(ZH, 'utf8')))
const enSet = new Set(en)
const zhSet = new Set(zh)

const missingInZh = [...enSet].filter((k) => !zhSet.has(k))
const missingInEn = [...zhSet].filter((k) => !enSet.has(k))

let ok = true
if (missingInZh.length) {
	ok = false
	console.error(`✗ zh-CN.json 缺少 ${missingInZh.length} 个键:\n  - ${missingInZh.join('\n  - ')}`)
}
if (missingInEn.length) {
	ok = false
	console.error(`✗ en.json 缺少 ${missingInEn.length} 个键:\n  - ${missingInEn.join('\n  - ')}`)
}

if (ok) {
	console.log(`✓ i18n 键同构校验通过（共 ${enSet.size} 个键，en ⇄ zh-CN）`)
	process.exit(0)
} else {
	console.error('\nCI 阻断：i18n 键未对齐。请在 M2 前补全缺失的翻译键。')
	process.exit(1)
}
