// features/plants/models.ts
export type Sunlight = 'full_sun' | 'partial_shade' | 'shade'
export type WaterNeed = 'low' | 'moderate' | 'high'
export type FertilizerNeed = 'low' | 'moderate' | 'high'
export type Lifespan = 'annual' | 'biennial' | 'perennial'
export type SowingMethod = 'direct' | 'module' | 'pot' | 'other'

export interface MonthWindow {
	// 1–12 (jan–dec). Tillåter svenska månadsnamn i UI, men numeriskt i data.
	earliest: number
	latest: number
}

export interface TempRangeC {
	min: number // °C
	max: number // °C
}

export interface DaysRange {
	min: number
	max: number
}

export interface Spacing {
	betweenPlantsCm: number
	betweenRowsCm?: number
}

export type CareEase = 1 | 2 | 3 // 1 = kräver omsorg, 3 = superlätt
export const CARE_EASE_LABEL: Record<CareEase, string> = {
	1: 'Kräver omsorg',
	2: 'Medel',
	3: 'Superlätt',
}

export interface PlantSpecies {
	id: string
	plantType: string // t.ex. "Tomat"
	variety: string // t.ex. "Cherry"
	lifespan: Lifespan // annual/biennial/perennial
	sowingWindow: MonthWindow
	sowingDepthMm: number
	germinationRatePct?: number
	germinationDays?: DaysRange
	germinationTemp?: TempRangeC
	spacing: Spacing
	sunlight: Sunlight
	water: WaterNeed
	fertilizer: FertilizerNeed
	growthHeightCm?: number
	spreadCm?: number // hur bred den blir
	isEdible: boolean
	soilType?: string
	harvestWindow?: MonthWindow
	sowingMethodHints?: SowingMethod[] // rekommenderade metoder
	frostSensitive?: boolean
	imageUrl?: string
	description?: string
	createdAt?: number
	updatedAt?: number
	careEase?: CareEase
}

export type PlantingStatus = 'planned' | 'sown' | 'transplanted' | 'growing' | 'harvest' | 'done' | 'failed'

export interface Planting {
	id: string
	speciesId: string // FK → PlantSpecies.id
	nickname?: string // “Balkongtomat 1”
	location?: string // “Växthus bädd A” / “Söderbalkong”
	method: SowingMethod
	seedsSown?: number
	seedsGerminated?: number
	dateSown?: string // ISO (YYYY-MM-DD)
	dateTransplanted?: string
	dateFirstHarvest?: string
	dateLastHarvest?: string
	spacingUsedCm?: Spacing
	potSizeL?: number
	trellisOrSupport?: boolean
	pruningNotes?: string
	irrigationNotes?: string
	fertilizerNotes?: string
	pestsOrDiseases?: string
	notes?: string
	photos?: string[]
	status: PlantingStatus
	lastWateredAt?: string
	nextActionAt?: string
	createdAt?: number
	updatedAt?: number
}

export const WATER_LABEL: Record<WaterNeed, string> = {
	low: 'Låg',
	moderate: 'Måttlig',
	high: 'Hög',
}
export const FERTILIZER_LABEL: Record<FertilizerNeed, string> = {
	low: 'Låg',
	moderate: 'Måttlig',
	high: 'Hög',
}
export const SUNLIGHT_META: Record<Sunlight, { label: string; icon: string }> = {
	full_sun: { label: 'Full sol', icon: 'sunny' }, // ☀️
	partial_shade: { label: 'Halvskugga', icon: 'partly_cloudy_day' }, // ⛅
	shade: { label: 'Skugga', icon: 'filter_drama' }, // 🌙
}
