// features/plants/domain/plants.options.ts
// prettier-ignore
import { SUNLIGHT_META, WATER_LABEL, SOIL_LABEL, SOIL_META, SOWING_META, MONTH_LABEL_SV, MONTH_LABEL_SV_SHORT, CULTIVATION_LABEL, WATER_META } from './plants.labels'
import type { Sunlight, WaterNeed, Soil, SowingMethod, Grade, Month1_12, Cultivation } from './plants.types'
import {
	SUNLIGHT,
	WATER_NEED,
	SOIL,
	SOWING,
	GRADE_VALUES,
	MONTHS_1_12,
	CULTIVATION,
	PLANT_TYPE_SUGGESTIONS,
} from './plants.keys'

// Generisk UI-optiontyp för select/listor
export type Option<T extends string | number> = {
	value: T
	label: string
	icon?: string // Material Symbol (om tillgängligt)
	tooltip?: string // valfritt, för t.ex. jord-meta
}

// === Ljus ===
export function makeSunlightOptions(): readonly Option<Sunlight>[] {
	return SUNLIGHT.map(v => ({ value: v, label: SUNLIGHT_META[v].label, icon: SUNLIGHT_META[v].icon }))
}

// === Vatten ===
export function makeWaterOptions(): readonly Option<WaterNeed>[] {
	return WATER_NEED.map(v => ({ value: v, label: WATER_META[v].label, icon: WATER_META[v].icon }))
}

// === Jord ===
export function makeSoilOptions(opts?: { includeTooltip?: boolean }): readonly Option<Soil>[] {
	return SOIL.map(v => ({
		value: v,
		label: SOIL_LABEL[v],
		tooltip: opts?.includeTooltip ? SOIL_META[v].tooltip : undefined,
	}))
}

// === Odlingssätt ===
export function makeCultivationOptions(): readonly Option<Cultivation>[] {
	return CULTIVATION.map(v => ({ value: v, label: CULTIVATION_LABEL[v] }))
}

// === Såmetoder ===
export function makeSowingOptions(): readonly Option<SowingMethod>[] {
	return SOWING.map(v => ({
		value: v,
		label: SOWING_META[v].label,
	}))
}

// === Betyg 1–5 ===
export function makeGradeOptions(opts?: { withIcon?: boolean }): readonly Option<Grade>[] {
	return GRADE_VALUES.map(g => ({
		value: g,
		label: String(g),
		icon: opts?.withIcon ? (`counter_${g}` as const) : undefined,
	}))
}

// === Månader (1–12) ===
export function makeMonthOptions(short = false): readonly Option<Month1_12>[] {
	return MONTHS_1_12.map(m => ({
		value: m,
		label: short ? MONTH_LABEL_SV_SHORT[m] : MONTH_LABEL_SV[m],
	}))
}

// === Växttyper (fria strängar med förslag) ===
export function makePlantTypeOptions(): readonly Option<string>[] {
	return PLANT_TYPE_SUGGESTIONS.map(label => ({ value: label, label }))
}
