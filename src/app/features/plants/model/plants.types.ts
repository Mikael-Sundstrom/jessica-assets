// features/plants/domain/plants.types.ts

// ====== Bas ======
export type Id = string
export type Cm = number

// 1–12 (för månader)
export type Month1_12 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type MonthWindow = {
	earliest: Month1_12
	latest: Month1_12
}

// ====== Skala ======
export type Scale = 1 | 2 | 3

// ====== Betyg ======
export type Grade = 1 | 2 | 3 | 4 | 5

// ====== Ljus / Vatten ======
export type Sunlight = 'full_sun' | 'partial_shade' | 'shade'
export type WaterNeed = 'low' | 'moderate' | 'high'

// ====== Odlingssätt (kort lista) ======
export type Cultivation = 'field' | 'greenhouse' | 'bed' | 'container' | 'indoor'

// ====== Jord (val per växt) ======
export type Soil =
	| 'seed' // Såjord (S-jord)
	| 'planting' // Planteringsjord
	| 'garden' // Trädgårdsjord
	| 'bloom' // Blomjord
	| 'veg_herb' // Grönsaks-/örtjord
	| 'tomato_chili' // Tomat-/chilijord
	| 'ericaceous' // Surjord (rhododendron m.fl.)
	| 'rose_perennial' // Ros- & perennjord
	| 'pelargon' // Pelargonjord
	| 'orchid' // Orkidéjord
	| 'citrus_mediterranean' // Citrus-/medelhavsjord
	| 'u_soil' // U-jord
	| 'p_soil' // P-jord
	| 'lawn_dress' // Dressjord (gräsmatta)
	| 'hydroponic' // Hydroponisk odling

// Strukturer för höjd & avstånd
export type HeightRangeCm = Cm | { min?: Cm; max?: Cm; approx?: Cm; note?: string }

export type Spacing = {
	betweenPlantsCm?: number
	betweenRowsCm?: number
}

// ====== Såmetoder ======
export type SowingMethod =
	| 'indoor' // Försådd inomhus
	| 'direct' // Direktsådd ute
	| 'hotbed' // Varmbänk/Drivbänk
	| 'coldframe' // Kallbänk/växthus utan värme

// (om du behöver i meta/labels)
export type Env = 'indoors' | 'outdoors' | 'outdoors_sheltered'

// ====== Tillsatser / “jordkompisar” ======
export type Amendment =
	| 'bark_mulch'
	| 'bark_mould'
	| 'leca'
	| 'biochar'
	| 'sand'
	| 'clay'
	| 'pumice'
	| 'peat'
	| 'peat_free'

// ====== Kärnmodell för PlantSpecies ======
export interface PlantSpecies {
	id: Id // Firestore-id

	// Identitet/visning
	plantType: string // t.ex. "Tomat", "Lavendel"
	variety?: string // t.ex. "Sungold"
	name?: string // visningsnamn
	description?: string
	imageUrl?: string

	// Badges/egenskaper
	sunlight?: Sunlight
	water?: WaterNeed
	soil?: Soil
	cultivation?: Cultivation[]
	grade?: Grade
	isEdible?: boolean

	// Odlingsdata
	sowingMethod?: SowingMethod
	sowingWindow?: MonthWindow
	sowingDepthMm?: number
	spacing?: Spacing
	growthHeightCm?: HeightRangeCm
	harvestWindow?: MonthWindow
}
