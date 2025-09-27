// features/plants/domain/plants.util.ts
import type { Month1_12, MonthWindow, HeightRangeCm, Cm, Spacing, Sunlight, WaterNeed, Scale } from './plants.types'
import { MONTHS_1_12 } from './plants.keys'
import { MONTH_LABEL_SV, MONTH_LABEL_SV_SHORT, SUNLIGHT_META, WATER_META } from './plants.labels'

/* =========================
 * Generellt / koercering
 * ========================= */
export function toNum(v: unknown): number | undefined {
	if (v === null || v === undefined || v === '') return undefined
	const n = Number(v)
	return Number.isFinite(n) ? n : undefined
}

/* =========================
 * Månadshjälpare (1–12)
 * ========================= */
export function wrapMonth(n: number): Month1_12 {
	// ((n-1) % 12 + 12) % 12 ger 0–11, +1 ger 1–12
	return (((((Math.round(n) - 1) % 12) + 12) % 12) + 1) as Month1_12
}

export function coerceMonth(v: unknown): Month1_12 | undefined {
	const n = toNum(v)
	if (n == null) return undefined
	return wrapMonth(n)
}

export function monthLabel(m: number | Month1_12, opts?: { short?: boolean }): string {
	const mm = wrapMonth(m)
	return opts?.short ? MONTH_LABEL_SV_SHORT[mm] : MONTH_LABEL_SV[mm]
}

/** Passar rakt in på MatSlider `displayWith` */
export function displayWithMonth(value: number): string {
	return monthLabel(value, { short: true })
}

/* =========================================
 * Window-hjälpare (from–to, med wrap-stöd)
 * ========================================= */
export function normalizeWindow(
	from?: number | null,
	to?: number | null,
	opts: { allowWrap?: boolean } = { allowWrap: true }
): MonthWindow | undefined {
	const f = coerceMonth(from)
	const t = coerceMonth(to)
	if (!f && !t) return undefined
	if (f && t) {
		if (!opts.allowWrap && f > t) {
			// Tvinga icke-wrap i stigande ordning
			return { earliest: f, latest: f }
		}
		return { earliest: f, latest: t }
	}
	// Om bara en sida satt – spegla till andra
	const one = (f ?? t)!
	return { earliest: one, latest: one }
}

/* =========================
 * Window-hjälpare (from–to, med wrap-stöd)
 * ========================= */
export function windowMonths(win: MonthWindow, opts: { allowWrap?: boolean } = { allowWrap: true }): Month1_12[] {
	const start = win.earliest
	const end = win.latest

	if (!opts.allowWrap || start <= end) {
		return MONTHS_1_12.filter(m => m >= start && m <= end)
	}
	// wrap: ex 8..12 + 1..3
	return [...MONTHS_1_12.filter(m => m >= start), ...MONTHS_1_12.filter(m => m <= end)]
}

export function monthInWindow(
	month: number | Month1_12,
	win: MonthWindow,
	opts: { allowWrap?: boolean } = { allowWrap: true }
): boolean {
	const m = wrapMonth(month)
	return windowMonths(win, opts).includes(m)
}

/* =========================
 * Höjd-hjälpare
 * ========================= */

/** Slå ihop två tal till HeightRangeCm (ren tal om lika; interval om olika). */
export function normalizeHeight(min?: number | null, max?: number | null): HeightRangeCm | undefined {
	const a = toNum(min)
	const b = toNum(max)
	if (a == null && b == null) return undefined
	if (a != null && b != null) {
		return a === b ? (a as Cm) : ({ min: a, max: b } as HeightRangeCm)
	}
	return { ...(a != null ? { min: a } : {}), ...(b != null ? { max: b } : {}) }
}

/** Extrahera min/max ur HeightRangeCm för formulärpatchning. */
export function heightMinMax(h?: HeightRangeCm): { min?: number; max?: number } {
	if (h == null) return {}
	if (typeof h === 'number') return { min: h, max: h }
	const { min, max } = h
	return { ...(min != null ? { min } : {}), ...(max != null ? { max } : {}) }
}

/* =========================
 * Smånyttigt
 * ========================= */
export function clamp(n: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, n))
}

/* =========================
 * Djupdiff (för uppdateringar)
 * ========================= */
export function isPlainObject(x: unknown): x is Record<string, unknown> {
	return x != null && typeof x === 'object' && Object.getPrototypeOf(x) === Object.prototype
}

/* ========================
 * Djup jämförelse för plain objects/arrayer/primities (snäll mot Date/Timestamp)
 * ======================== */
export function deepEqual(a: any, b: any): boolean {
	if (a === b) return true
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false
		for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
		return true
	}
	if (isPlainObject(a) && isPlainObject(b)) {
		const ak = Object.keys(a),
			bk = Object.keys(b)
		if (ak.length !== bk.length) return false
		for (const k of ak) if (!deepEqual(a[k], b[k])) return false
		return true
	}
	// Date, Firestore Timestamp, GeoPoint m.m. → fall tillbaka på strict equal ovan
	return false
}

/* ========================
 * Djup diff som hoppar över undefined/tomma strängar/tomma plain objects
 * ======================== */
export function deepDiffClean<T extends Record<string, any>>(original: T, next: T): Partial<T> {
	const out: any = {}
	for (const key of Object.keys(next)) {
		const a = (original as any)[key]
		const b = (next as any)[key]

		if (deepEqual(a, b)) continue
		if (b === undefined) continue
		if (typeof b === 'string' && b.trim() === '') continue

		if (isPlainObject(b)) {
			const sub = deepDiffClean(isPlainObject(a) ? a : {}, b)
			if (Object.keys(sub).length) out[key] = sub
			continue
		}

		out[key] = b
	}
	return out
}

/* =========================
 * Spacing-hjälpare
 * ========================= */
export function spacingFrom(betweenPlantsCm?: number | null, betweenRowsCm?: number | null): Spacing | undefined {
	const s: Spacing = {}
	if (betweenPlantsCm != null) s.betweenPlantsCm = betweenPlantsCm
	if (betweenRowsCm != null) s.betweenRowsCm = betweenRowsCm
	return Object.keys(s).length ? s : undefined
}

/* =========================
 * Format Cm (för visning)
 * ========================= */
export function formatCm(value: number): string {
	return Number.isFinite(value) ? `${Math.round(value)} cm` : ''
}
export function formatMm(value: number): string {
	return Number.isFinite(value) ? `${Math.round(value)} mm` : ''
}

export function formatMax(v?: number) {
	if (v == null) return ''
	return v >= 100 ? '≥100 cm' : `${v} cm`
}

// För intervall-sammanfattning
export function formatSpacing(s?: Spacing): string {
	if (!s) return '—'
	const p = s.betweenPlantsCm
	const r = s.betweenRowsCm

	const isNum = (v: unknown): v is number => Number.isFinite(v as number)
	const fmt = (v: number) => (v >= 100 ? '≥100 cm' : `${Math.round(v)} cm`)

	if (isNum(p) && isNum(r)) {
		const pr = Math.round(p)
		const rr = Math.round(r)
		if (pr === rr) {
			// båda lika → enbart ett värde
			return pr >= 100 ? '≥100 cm' : `${pr} cm`
		}
		// olika → visa båda
		return `${fmt(p)} / rad ${fmt(r)}`
	}

	if (isNum(p)) return fmt(p)
	if (isNum(r)) return `rad ${fmt(r)}`
	return '—'
}

/* =========================
 * Ljusnivå-hjälpare (ikon/label från scale 1-3)
 * ========================= */
const clampScale = (v: number | null | undefined): Scale => (v == null ? 1 : v <= 1 ? 1 : v >= 3 ? 3 : 2) as Scale
type LevelMeta = { label: string; icon: string; scale: number } // scale 1-3
// Förberedd lista sorterad på scale: 1,2,3
const SUNLIGHT_SORTED: LevelMeta[] = (Object.entries(SUNLIGHT_META) as [Sunlight, LevelMeta][])
	.sort((a, b) => a[1].scale - b[1].scale)
	.map(([, m]) => m)

export const sunIconByScale = (v: number | null) => SUNLIGHT_SORTED[clampScale(v) - 1].icon
export const sunLabelByScale = (v: number | null) => SUNLIGHT_SORTED[clampScale(v) - 1].label

/* =========================
 * Vattennivå-hjälpare (ikon från scale 1-3)
 * ========================= */
const WATER_SORTED: LevelMeta[] = (Object.entries(WATER_META) as [WaterNeed, LevelMeta][])
	.sort((a, b) => a[1].scale - b[1].scale)
	.map(([, m]) => m)
export const waterIconByScale = (v: number | null) => WATER_SORTED[clampScale(v) - 1].icon
export const waterLabelByScale = (v: number | null) => WATER_SORTED[clampScale(v) - 1].label
