// features/plants/models.ts

// ================================
// 🌞 Ljus / 💧 Vatten / 🧪 Gödsling
// ================================
export const SUNLIGHT = ['full_sun', 'partial_shade', 'shade'] as const
export type Sunlight = (typeof SUNLIGHT)[number]

export const WATER_NEED = ['low', 'moderate', 'high'] as const
export type WaterNeed = (typeof WATER_NEED)[number]

export const WATER_LABEL: Record<WaterNeed, string> = {
	low: 'Lite bevattning',
	moderate: 'Måttlig bevattning',
	high: 'Mycket bevattning',
}

export const SUNLIGHT_META: Record<Sunlight, { label: string; icon: string }> = {
	full_sun: { label: 'Full sol', icon: 'sunny' },
	partial_shade: { label: 'Halvskugga', icon: 'partly_cloudy_day' },
	shade: { label: 'Skugga', icon: 'filter_drama' },
}

// ================================
// 📆 Fönster / Skötsel / Avstånd
// ================================
export type MonthWindow = { earliest: number; latest: number } // 1–12

// ⭐ Betyg
export type Grade = 1 | 2 | 3 | 4 | 5
export const MAX_GRADE: Grade = 5

export const GRADE_LABEL: Record<Grade, number> = {
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
}

// ================================
/** 📏 Höjd som tal ELLER intervall */
// ================================
export type Cm = number
export type HeightRangeCm = Cm | { min?: Cm; max?: Cm; approx?: Cm; note?: string } // ex: {min:60,max:90}
export type Spacing = { betweenPlantsCm?: number; betweenRowsCm?: number }

// ================================
// 🌱 Jordtyper (val per växt)
// ================================
export const SOIL = [
	'seed', // Såjord (S-jord)
	'planting', // Planteringsjord/plantjord (allround)
	'garden', // Trädgårdsjord (jordförbättring/bas)
	'bloom', // Blomjord
	'veg_herb', // Grönsaks-/örtjord
	'tomato_chili', // Tomat-/chilijord
	'ericaceous', // Surjord (rhododendron m.fl.)
	'rose_perennial', // Ros- & perennjord
	'pelargon', // Pelargonjord
	'orchid', // Orkidéjord (barkblandning)
	'citrus_mediterranean', // Citrus-/medelhavsjord
	'u_soil', // U-jord (urn-/krukjord, kraftigt gödslad)
	'p_soil', // P-jord (kraftigt gödslad proffsvariant)
	'lawn_dress', // Dressjord för gräsmatta (toppdress)
	'hydroponic', // Hydroponisk odling (substratlösning)
] as const
export type Soil = (typeof SOIL)[number]

export const SOIL_LABEL: Record<Soil, string> = {
	seed: 'Såjord (S-jord)',
	planting: 'Planteringsjord',
	garden: 'Trädgårdsjord (bas/förbättring)',
	bloom: 'Blomjord',
	veg_herb: 'Grönsaks- & örtjord',
	tomato_chili: 'Tomat- & chilijord',
	ericaceous: 'Surjord (rhododendron m.fl.)',
	rose_perennial: 'Ros- & perennjord',
	pelargon: 'Pelargonjord',
	orchid: 'Orkidéjord',
	citrus_mediterranean: 'Citrus- & medelhavsjord',
	u_soil: 'U-jord (urna/kruka)',
	p_soil: 'P-jord (proffs)',
	lawn_dress: 'Dressjord (gräsmatta)',
	hydroponic: 'Hydroponisk odling',
}

// Enkel metadata för UI/filtrering
type Nutrient = 'low' | 'medium' | 'high' | 'very_high'
type Drainage = 'low' | 'medium' | 'high'
type PH = 'acid' | 'neutral' | 'wide'

export interface SoilMeta {
	label: string
	nutrient: Nutrient
	drainage: Drainage
	ph: PH
	typicalUses?: string[]
	tooltip?: string // färdigformulerad text om du vill
}

export const SOIL_META: Record<Soil, SoilMeta> = {
	seed: {
		label: SOIL_LABEL.seed,
		nutrient: 'low',
		drainage: 'high',
		ph: 'neutral',
		typicalUses: ['Frösådd', 'Sticklingar', 'Förodling inomhus'],
		tooltip:
			'Såjord är en finkornig, näringsfattig jord som skyddar späda rötter vid frösådd och förodling. Vanligt användningsområde är frösådd, sticklingar och förodling inomhus.',
	},
	planting: {
		label: SOIL_LABEL.planting,
		nutrient: 'medium',
		drainage: 'medium',
		ph: 'wide',
		typicalUses: ['Pallkrage', 'Rabatter', 'Buskar & träd'],
		tooltip:
			'Planteringsjord är en allround jord för plantering både ute och inne. Vanligt användningsområde är pallkrage, rabatter, buskar och träd.',
	},
	garden: {
		label: SOIL_LABEL.garden,
		nutrient: 'medium',
		drainage: 'medium',
		ph: 'wide',
		typicalUses: ['Jordförbättring', 'Plantering i mark'],
		tooltip:
			'Trädgårdsjord är en basjord för jordförbättring av befintlig markjord. Vanligt användningsområde är jordförbättring och plantering i mark.',
	},
	bloom: {
		label: SOIL_LABEL.bloom,
		nutrient: 'high',
		drainage: 'medium',
		ph: 'neutral',
		typicalUses: ['Blommande krukväxter', 'Inne/ute'],
		tooltip:
			'Blomjord är en jord med långtidsverkande näring, ofta med perlit eller leca för porositet. Vanligt användningsområde är blommande krukväxter både inne och ute.',
	},
	veg_herb: {
		label: SOIL_LABEL.veg_herb,
		nutrient: 'high',
		drainage: 'medium',
		ph: 'neutral',
		typicalUses: ['Sallat', 'Örter', 'Rotfrukter'],
		tooltip:
			'Grönsaks- och örtjord är näringsrik med extra kalium, bra för köksträdgården. Vanliga användningar: sallat, örter och rotfrukter. Förkultivera gärna i såjord och plantera om i denna jord.',
	},
	tomato_chili: {
		label: SOIL_LABEL.tomato_chili,
		nutrient: 'very_high',
		drainage: 'medium',
		ph: 'neutral',
		typicalUses: ['Tomat', 'Chili', 'Paprika'],
		tooltip:
			'Tomat- och chilijord är en jord rik på kalium, kalcium och magnesium för fruktsättande växter. Vanligt användningsområde är tomat, chili och paprika.',
	},
	ericaceous: {
		label: SOIL_LABEL.ericaceous,
		nutrient: 'medium',
		drainage: 'high',
		ph: 'acid',
		typicalUses: ['Rhododendron', 'Azalea', 'Blåbär', 'Ljung'],
		tooltip:
			'Surjord är en jord med lågt pH för surjordsväxter. Vanligt användningsområde är rhododendron, azalea, blåbär och ljung.',
	},
	rose_perennial: {
		label: SOIL_LABEL.rose_perennial,
		nutrient: 'high',
		drainage: 'medium',
		ph: 'neutral',
		typicalUses: ['Rosor', 'Klematis', 'Perenner'],
		tooltip:
			'Ros- och perennjord är en tyngre jord med lera och kalium för knoppbildning. Vanligt användningsområde är rosor, klematis och perenner.',
	},
	pelargon: {
		label: SOIL_LABEL.pelargon,
		nutrient: 'high',
		drainage: 'medium',
		ph: 'neutral',
		typicalUses: ['Pelargoner', 'Sommarblommor'],
		tooltip:
			'Pelargonjord är en stabil, fukthållande jord som ofta är tillsatt järn. Vanligt användningsområde är pelargoner och sommarblommor.',
	},
	orchid: {
		label: SOIL_LABEL.orchid,
		nutrient: 'low',
		drainage: 'high',
		ph: 'neutral',
		typicalUses: ['Orkidéer (epifyter)'],
		tooltip:
			'Orkidéjord är en luftig barkblandning (inte ”jord” i klassisk mening). Vanligt användningsområde är orkidéer (epifyter).',
	},
	citrus_mediterranean: {
		label: SOIL_LABEL.citrus_mediterranean,
		nutrient: 'high',
		drainage: 'high',
		ph: 'acid',
		typicalUses: ['Citrus', 'Oliv', 'Lager', 'Fikon', 'Nerium'],
		tooltip:
			'Citrus- och medelhavsjord har grövre struktur, lägre pH och extra mikronäring/järn. Vanligt användningsområde är citrus, oliv, lager, fikon och nerium.',
	},
	u_soil: {
		label: SOIL_LABEL.u_soil,
		nutrient: 'very_high',
		drainage: 'medium',
		ph: 'neutral',
		typicalUses: ['Stora krukväxter', 'Hungriga ettåringar'],
		tooltip:
			'U-jord är en strukturstabil urn- och krukjord för lång kulturtid. Vanligt användningsområde är stora krukväxter och hungriga ettåringar.',
	},
	p_soil: {
		label: SOIL_LABEL.p_soil,
		nutrient: 'very_high',
		drainage: 'medium',
		ph: 'neutral',
		typicalUses: ['Professionell odling', 'Lång kulturtid'],
		tooltip:
			'P-jord är en kraftigt gödslad variant för snabb tillväxt. Vanligt användningsområde är professionell odling och växter med lång kulturtid.',
	},
	lawn_dress: {
		label: SOIL_LABEL.lawn_dress,
		nutrient: 'medium',
		drainage: 'high',
		ph: 'neutral',
		typicalUses: ['Gräsmatta (dressning, stödsådd)'],
		tooltip:
			'Dressjord för gräsmatta är en sandrik toppdress som luftar och jämnar gräsmattan. Vanligt användningsområde är gräsmatta (dressning, stödsådd).',
	},
	hydroponic: {
		label: SOIL_LABEL.hydroponic,
		nutrient: 'low',
		drainage: 'high',
		ph: 'neutral',
		typicalUses: ['Hydroponisk odling'],
		tooltip:
			'Hydroponisk odling använder substrat/vatten där näring tillförs via lösningen. Vanligt användningsområde är hydroponisk odling.',
	},
}

// ================================
// 🌱 Såmetoder
// ================================
export const SOWING = [
	'indoor', // Försådd inomhus
	'direct', // Direktsådd ute
	'hotbed', // Varmbänk/Drivbänk
	'winter', // Vinterförsådd
	'coldframe', // Kallsådd (kallbänk/växthus utan värme)
	'autumn', // Höstdirektsådd
	'cuttings', // Sticklingar
	'division', // Delning
] as const
export type SowingMethod = (typeof SOWING)[number]

export const SOWING_LABEL: Record<SowingMethod, string> = {
	indoor: 'Försådd (inomhus)',
	direct: 'Direktsådd',
	hotbed: 'Varmbänk/Drivbänk',
	winter: 'Vinterförsådd',
	coldframe: 'Kallsådd (kallbänk)',
	autumn: 'Höstdirektsådd',
	cuttings: 'Sticklingar',
	division: 'Delning',
}

type Env = 'indoors' | 'outdoors' | 'outdoors_sheltered'
export interface SowingMeta {
	label: string
	icon: string // Material symbol
	env: Env // Typisk miljö
	short: string // 1–2 rader till tooltip/badge
	examples?: string[] // Vanliga växter
	notes?: string // Valfri extra info
}

export const SOWING_META: Record<SowingMethod, SowingMeta> = {
	indoor: {
		label: SOWING_LABEL.indoor,
		icon: 'home',
		env: 'indoors',
		short: 'Så inomhus tidigt för försprång, plantera ut senare.',
		examples: ['Tomat', 'Chili', 'Paprika', 'Purjo', 'Sommarblommor'],
	},
	direct: {
		label: SOWING_LABEL.direct,
		icon: 'yard',
		env: 'outdoors',
		short: 'Så direkt på växtplatsen när jorden värmts upp.',
		examples: ['Morot', 'Rädisor', 'Sallat', 'Ärter', 'Bönor'],
	},
	hotbed: {
		label: SOWING_LABEL.hotbed,
		icon: 'local_fire_department',
		env: 'outdoors_sheltered',
		short: 'Uppvärmd bädd för extra tidig start utomhus.',
		examples: ['Sallat', 'Spenat', 'Tidiga kålväxter'],
		notes: 'Värme från gödsel/kompost. Bra för tidig vår.',
	},
	winter: {
		label: SOWING_LABEL.winter,
		icon: 'ac_unit',
		env: 'outdoors_sheltered',
		short: 'Så i kall miljö under vintern – gror naturligt på våren.',
		examples: ['Perenner', 'Vissa örter', 'Köldgroende arter'],
	},
	coldframe: {
		label: SOWING_LABEL.coldframe,
		icon: 'device_thermostat',
		env: 'outdoors_sheltered',
		short: 'Tidigt säsongsstart i kallbänk/växthus utan värme.',
		examples: ['Spenat', 'Sallat', 'Persilja'],
	},
	autumn: {
		label: SOWING_LABEL.autumn,
		icon: 'calendar_month',
		env: 'outdoors',
		short: 'Så på hösten för tidig groning nästa vår.',
		examples: ['Morot', 'Persilja', 'Vissa perenner'],
	},
	cuttings: {
		label: SOWING_LABEL.cuttings,
		icon: 'content_cut',
		env: 'indoors',
		short: 'Föröka från skott/kvistar som rotas.',
		examples: ['Pelargon', 'Lavendel', 'Vinbär', 'Örter'],
	},
	division: {
		label: SOWING_LABEL.division,
		icon: 'call_split',
		env: 'outdoors',
		short: 'Dela etablerade plantor i flera delar.',
		examples: ['Perenner', 'Rabarber', 'Gräslök'],
	},
}

// ================================
// 🌿 Växter / Plantarter
// ================================
// prettier-ignore
export interface PlantSpecies {
  id: string                     // Firestore-id (genereras av databasen, används i UI och uppslag)
  plantType: string              // Växttyp/slag (t.ex. "Tomat", "Pelargon", "Lavendel")
  variety?: string               // Sort/variant (t.ex. "Moneymaker", "Sungold") – valfritt
  name?: string                  // Visningsnamn/egen benämning i appen – valfritt
  description?: string           // Kort beskrivning/anteckningar – valfritt
  imageUrl?: string              // Länk till bild – valfritt

  // Badges
  sunlight?: Sunlight            // Ljuskrav: 'full_sun' | 'partial_shade' | 'shade' – valfritt
  water?: WaterNeed              // Vattenbehov: 'low' | 'moderate' | 'high' – valfritt
  soil?: Soil                    // Rekommenderad jordtyp (från SOIL-listan) – valfritt
  grade?: Grade                  // Plantans betyg 1–5 – valfritt
  isEdible?: boolean             // Ätbar växt (true/false) – valfritt

  // Fakta
  sowingMethod?: SowingMethod  // t.ex. ['indoor'] eller ['direct','coldframe']
  sowingWindow?: MonthWindow     // Såfönster { earliest: 1–12, latest: 1–12 } – valfritt
  sowingDepthMm?: number         // Sådjup i millimeter – valfritt
  spacing?: Spacing              // Avstånd { betweenPlantsCm?, betweenRowsCm? } – valfritt
  growthHeightCm?: HeightRangeCm // Sluthöjd i cm, t.ex. 75 ELLER { min?, max?, approx?, note? } – valfritt
  harvestWindow?: MonthWindow    // Skördefönster { earliest: 1–12, latest: 1–12 } – valfritt
}

// ================================
// 🧱 Jordkompisar / tillsatser
// ================================
export const AMENDMENTS = [
	'bark_mulch', // Täckbark
	'bark_mould', // Barkmull/barkmylla
	'leca', // Lecakulor
	'biochar', // Biokol
	'sand', // Odlingssand
	'clay', // Lera
	'pumice', // Pimpsten
	'peat', // Torv
	'peat_free', // Torvfri bas (träfiber/kompost m.m.)
] as const
export type Amendment = (typeof AMENDMENTS)[number]

export const AMENDMENT_LABEL: Record<Amendment, string> = {
	bark_mulch: 'Täckbark',
	bark_mould: 'Barkmull',
	leca: 'Lecakulor',
	biochar: 'Biokol',
	sand: 'Odlingssand',
	clay: 'Lera',
	pumice: 'Pimpsten',
	peat: 'Torv',
	peat_free: 'Torvfri basblandning',
}
